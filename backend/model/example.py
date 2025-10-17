import torch
import torch.nn as nn
from torchvision import models, transforms
from ultralytics import YOLO
import supervision as sv
import cv2
from collections import defaultdict, deque
import time

# ============================================
# MODEL DEFINITIONS
# ============================================


def create_emotion_model(num_classes=7):
    """Create the same MobileNet architecture used for training"""
    model = models.mobilenet_v2(pretrained=False)

    # Modify first layer for grayscale
    model.features[0][0] = nn.Conv2d(1, 32, kernel_size=3, stride=2, padding=1, bias=False)

    # Replace classifier
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(in_features, 256),
        nn.ReLU(),
        nn.Dropout(0.3),
        nn.Linear(256, num_classes)
    )

    return model

# ============================================
# EMOTION HISTORY TRACKER
# ============================================


class EmotionTracker:
    """Tracks emotions over time with temporal smoothing"""

    def __init__(self, window_seconds=5, update_interval=1.0):
        self.window_seconds = window_seconds
        self.update_interval = update_interval

        # Store emotion history: {tracker_id: [(timestamp, emotion), ...]}
        self.emotion_history = defaultdict(deque)

        # Store current displayed emotion: {tracker_id: (emotion, confidence, last_update_time)}
        self.current_emotions = {}

        # Last seen time for each tracker
        self.last_seen = {}

    def add_detection(self, tracker_id, emotion, confidence, current_time):
        """Add a new emotion detection for a tracked person"""
        # Add to history
        self.emotion_history[tracker_id].append((current_time, emotion, confidence))

        # Update last seen
        self.last_seen[tracker_id] = current_time

        # Clean old detections outside window
        cutoff_time = current_time - self.window_seconds
        while (self.emotion_history[tracker_id] and
               self.emotion_history[tracker_id][0][0] < cutoff_time):
            self.emotion_history[tracker_id].popleft()

    def get_smoothed_emotion(self, tracker_id, current_time):
        """Get the most frequent emotion in the time window"""
        # Check if we should update (every update_interval seconds)
        if tracker_id in self.current_emotions:
            last_emotion, last_conf, last_update = self.current_emotions[tracker_id]
            if current_time - last_update < self.update_interval:
                # Return cached emotion
                return last_emotion, last_conf

        # Calculate most frequent emotion in window
        if tracker_id not in self.emotion_history or not self.emotion_history[tracker_id]:
            return None, 0.0

        # Count emotions with weighted confidence
        emotion_scores = defaultdict(float)
        total_weight = 0

        for timestamp, emotion, confidence in self.emotion_history[tracker_id]:
            # Weight recent detections more heavily
            age = current_time - timestamp
            weight = confidence * (1 - age / self.window_seconds)
            emotion_scores[emotion] += weight
            total_weight += weight

        # Get emotion with highest score
        if not emotion_scores:
            return None, 0.0

        best_emotion = max(emotion_scores, key=emotion_scores.get)
        avg_confidence = emotion_scores[best_emotion] / (total_weight / len(emotion_scores))
        avg_confidence = min(1.0, avg_confidence)  # Cap at 1.0

        # Update cache
        self.current_emotions[tracker_id] = (best_emotion, avg_confidence, current_time)

        return best_emotion, avg_confidence

    def cleanup_old_trackers(self, current_time, timeout=10.0):
        """Remove trackers not seen in timeout seconds"""
        to_remove = []
        for tracker_id, last_time in self.last_seen.items():
            if current_time - last_time > timeout:
                to_remove.append(tracker_id)

        for tracker_id in to_remove:
            if tracker_id in self.emotion_history:
                del self.emotion_history[tracker_id]
            if tracker_id in self.current_emotions:
                del self.current_emotions[tracker_id]
            if tracker_id in self.last_seen:
                del self.last_seen[tracker_id]

# ============================================
# LOAD MODELS
# ============================================


print("Loading models...")

# Load YOLO for person detection
yolo_model = YOLO('yolov8n.pt')
print("✓ YOLO loaded")

# Initialize ByteTrack tracker with longer memory
tracker = sv.ByteTrack(
    track_activation_threshold=0.4,
    lost_track_buffer=90,  # Keep track for 90 frames (~3 seconds at 30fps)
    minimum_matching_threshold=0.7,  # Lower threshold for better re-identification
    minimum_consecutive_frames=3,
    frame_rate=30
)
print("✓ ByteTrack tracker loaded")

# Load OpenCV face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
print("✓ Face detector loaded")

# Load emotion model
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
emotion_model = create_emotion_model(num_classes=7).to(device)

checkpoint = torch.load('best_emotion_model.pth', map_location=device)
emotion_model.load_state_dict(checkpoint['model_state_dict'])
emotion_model.eval()
print(f"✓ Emotion model loaded (Best acc: {checkpoint['best_acc']:.2f}%)")
print(f"✓ Using device: {device}")

# Emotion labels
emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']

# Transform for emotion model
emotion_transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((48, 48)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5], std=[0.5])
])

# Initialize emotion tracker
emotion_tracker = EmotionTracker(window_seconds=3, update_interval=1.0)

# ============================================
# HELPER FUNCTIONS
# ============================================


def get_emotion(face_image, model, transform, device):
    """Predict emotion from face image"""
    if face_image.size == 0:
        return None, 0.0

    try:
        face_tensor = transform(face_image).unsqueeze(0).to(device)

        with torch.no_grad():
            output = model(face_tensor)
            probabilities = torch.nn.functional.softmax(output, dim=1)
            confidence, predicted = torch.max(probabilities, 1)

        emotion_label = emotions[predicted.item()]
        confidence_score = confidence.item()

        return emotion_label, confidence_score
    except Exception:
        return None, 0.0


def draw_label(frame, text, pos, bg_color, text_color=(255, 255, 255)):
    """Draw text with background"""
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.6
    thickness = 2

    (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)

    x, y = pos
    cv2.rectangle(frame, (x, y - text_height - 10), (x + text_width + 10, y), bg_color, -1)
    cv2.putText(frame, text, (x + 5, y - 5), font, font_scale, text_color, thickness)


# Emotion colors
emotion_colors = {
    'Happy': (0, 255, 255),
    'Sad': (255, 0, 0),
    'Angry': (0, 0, 255),
    'Surprise': (255, 0, 255),
    'Fear': (128, 0, 128),
    'Disgust': (0, 128, 0),
    'Neutral': (200, 200, 200)
}

# ============================================
# MAIN DETECTION LOOP
# ============================================

print("\nStarting camera...")
print("Press 'q' to quit")
print("Emotion smoothing: 5 second window, updates every 1 second\n")

cap = cv2.VideoCapture(0)
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

if not cap.isOpened():
    print("Error: Could not open camera")
    exit()

frame_count = 0
fps_display = 0
fps_start_time = time.time()

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    current_time = time.time()

    # Calculate FPS
    if frame_count % 30 == 0:
        fps_end_time = time.time()
        fps_display = 30 / (fps_end_time - fps_start_time)
        fps_start_time = fps_end_time

    # Detect people with YOLO
    results = yolo_model(frame, classes=[0], verbose=False, conf=0.5)

    # Convert to Supervision detections
    detections = sv.Detections.from_ultralytics(results[0])

    # Update tracker
    detections = tracker.update_with_detections(detections)

    # Process each tracked person
    for i, (xyxy, confidence, class_id, tracker_id) in enumerate(zip(
        detections.xyxy,
        detections.confidence,
        detections.class_id,
        detections.tracker_id
    )):
        x1, y1, x2, y2 = map(int, xyxy)

        # Ensure valid coordinates
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(frame.shape[1], x2), min(frame.shape[0], y2)

        # Extract person region
        person_crop = frame[y1:y2, x1:x2]

        if person_crop.size == 0:
            continue

        # Detect faces in person crop
        gray_person = cv2.cvtColor(person_crop, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(
            gray_person,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )

        # Get smoothed emotion for this tracker
        smoothed_emotion, smoothed_conf = emotion_tracker.get_smoothed_emotion(
            tracker_id, current_time)

        # Determine box color
        if smoothed_emotion:
            box_color = emotion_colors.get(smoothed_emotion, (0, 255, 0))
        else:
            box_color = (0, 255, 0)

        # Draw person bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)

        # Draw person ID
        draw_label(frame, f'ID: {tracker_id}', (x1, y1), box_color)

        # Process faces and add to emotion history
        for (fx, fy, fw, fh) in faces:
            face_x1 = x1 + fx
            face_y1 = y1 + fy
            face_x2 = face_x1 + fw
            face_y2 = face_y1 + fh

            # Extract face
            face_crop = frame[face_y1:face_y2, face_x1:face_x2]

            # Predict emotion (raw, for history)
            raw_emotion, raw_confidence = get_emotion(
                face_crop, emotion_model, emotion_transform, device)

            if raw_emotion:
                # Add to tracker history
                emotion_tracker.add_detection(tracker_id, raw_emotion, raw_confidence, current_time)

                # Draw face rectangle (subtle)
                cv2.rectangle(frame, (face_x1, face_y1), (face_x2, face_y2), box_color, 1)

        # Display smoothed emotion
        if smoothed_emotion:
            label = f'{smoothed_emotion} ({smoothed_conf * 100:.0f}%)'
            draw_label(frame, label, (x1, y2 + 5), box_color)

            # Show history size (for debugging)
            history_size = len(emotion_tracker.emotion_history.get(tracker_id, []))
            debug_text = f'Samples: {history_size}'
            cv2.putText(frame, debug_text, (x1, y2 + 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.4, box_color, 1)

    # Cleanup old trackers (keep for 10 seconds after last seen)
    emotion_tracker.cleanup_old_trackers(current_time, timeout=10.0)

    # Display info
    cv2.putText(frame, f'FPS: {fps_display:.1f}', (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    cv2.putText(frame, f'Active tracks: {len(emotion_tracker.last_seen)}', (10, 60),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    cv2.imshow('Real-time Emotion Detection (Smoothed)', frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("\nCamera closed")
