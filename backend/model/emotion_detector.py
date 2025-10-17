"""
FastAPI WebSocket Emotion Detection Integration

Split into two files:
1. emotion_detector.py - This file (camera + detection logic)
2. fastapi_router.py - Your FastAPI router (imports from this)
"""

import torch
import torch.nn as nn
from torchvision import models, transforms
from ultralytics import YOLO
import supervision as sv
import cv2
from collections import defaultdict, deque
import time
import base64
from threading import Thread, Lock

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
        self.emotion_history = defaultdict(deque)
        self.current_emotions = {}
        self.last_seen = {}

    def add_detection(self, tracker_id, emotion, confidence, current_time):
        """Add a new emotion detection for a tracked person"""
        self.emotion_history[tracker_id].append((current_time, emotion, confidence))
        self.last_seen[tracker_id] = current_time

        # Clean old detections
        cutoff_time = current_time - self.window_seconds
        while (self.emotion_history[tracker_id] and
               self.emotion_history[tracker_id][0][0] < cutoff_time):
            self.emotion_history[tracker_id].popleft()

    def get_smoothed_emotion(self, tracker_id, current_time):
        """Get the most frequent emotion in the time window"""
        if tracker_id in self.current_emotions:
            last_emotion, last_conf, last_update = self.current_emotions[tracker_id]
            if current_time - last_update < self.update_interval:
                return last_emotion, last_conf

        if tracker_id not in self.emotion_history or not self.emotion_history[tracker_id]:
            return None, 0.0

        # Count emotions with weighted confidence
        emotion_scores = defaultdict(float)
        total_weight = 0

        for timestamp, emotion, confidence in self.emotion_history[tracker_id]:
            age = current_time - timestamp
            weight = confidence * (1 - age / self.window_seconds)
            emotion_scores[emotion] += weight
            total_weight += weight

        if not emotion_scores:
            return None, 0.0

        best_emotion = max(emotion_scores, key=emotion_scores.get)
        avg_confidence = emotion_scores[best_emotion] / (total_weight / len(emotion_scores))
        avg_confidence = min(1.0, avg_confidence)

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
# FRAME BROADCASTER - SINGLETON
# ============================================


class EmotionDetectionBroadcaster:
    """Singleton broadcaster for emotion detection frames"""

    _instance = None
    _initialized = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self.clients = set()
        self.current_frame = None
        self.current_data = None  # Store emotion data
        self.frame_lock = Lock()
        self.running = False
        self.detection_thread = None

        # Models (lazy loaded)
        self.yolo_model = None
        self.tracker = None
        self.face_cascade = None
        self.emotion_model = None
        self.emotion_transform = None
        self.emotion_tracker = None
        self.device = None

        self.emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
        self.emotion_colors = {
            'Happy': (0, 255, 255),
            'Sad': (255, 0, 0),
            'Angry': (0, 0, 255),
            'Surprise': (255, 0, 255),
            'Fear': (128, 0, 128),
            'Disgust': (0, 128, 0),
            'Neutral': (200, 200, 200)
        }

        self._initialized = True

    def load_models(self):
        """Load all models (call once)"""
        if self.yolo_model is not None:
            return

        print("Loading models...")

        # YOLO
        self.yolo_model = YOLO('yolov8n.pt')
        print("✓ YOLO loaded")

        # Tracker
        self.tracker = sv.ByteTrack(
            track_activation_threshold=0.4,
            lost_track_buffer=90,
            minimum_matching_threshold=0.7,
            minimum_consecutive_frames=3,
            frame_rate=30
        )
        print("✓ ByteTrack tracker loaded")

        # Face detector
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        print("✓ Face detector loaded")

        # Emotion model
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.emotion_model = create_emotion_model(num_classes=7).to(self.device)

        checkpoint = torch.load('best_emotion_model.pth', map_location=self.device)
        self.emotion_model.load_state_dict(checkpoint['model_state_dict'])
        self.emotion_model.eval()
        print(f"✓ Emotion model loaded (Best acc: {checkpoint['best_acc']:.2f}%)")

        # Transform
        self.emotion_transform = transforms.Compose([
            transforms.ToPILImage(),
            transforms.Grayscale(num_output_channels=1),
            transforms.Resize((48, 48)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5], std=[0.5])
        ])

        # Emotion tracker
        self.emotion_tracker = EmotionTracker(window_seconds=5, update_interval=1.0)

        print(f"✓ Using device: {self.device}")

    def get_emotion(self, face_image):
        """Predict emotion from face image"""
        if face_image.size == 0:
            return None, 0.0

        try:
            face_tensor = self.emotion_transform(face_image).unsqueeze(0).to(self.device)

            with torch.no_grad():
                output = self.emotion_model(face_tensor)
                probabilities = torch.nn.functional.softmax(output, dim=1)
                confidence, predicted = torch.max(probabilities, 1)

            emotion_label = self.emotions[predicted.item()]
            confidence_score = confidence.item()

            return emotion_label, confidence_score

        except Exception as e:
            return None, 0.0

    def draw_label(self, frame, text, pos, bg_color, text_color=(255, 255, 255)):
        """Draw text with background"""
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.6
        thickness = 2

        (text_width, text_height), baseline = cv2.getTextSize(text, font, font_scale, thickness)

        x, y = pos
        cv2.rectangle(frame, (x, y - text_height - 10), (x + text_width + 10, y), bg_color, -1)
        cv2.putText(frame, text, (x + 5, y - 5), font, font_scale, text_color, thickness)

    def process_frame(self, frame):
        """Process a single frame and return annotated frame"""
        current_time = time.time()

        # Store detection results for this frame
        frame_data = {
            'people': []
        }

        # Detect people with YOLO
        results = self.yolo_model(frame, classes=[0], verbose=False, conf=0.5)

        # Convert to Supervision detections
        detections = sv.Detections.from_ultralytics(results[0])

        # Update tracker
        detections = self.tracker.update_with_detections(detections)

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

            # Detect faces
            gray_person = cv2.cvtColor(person_crop, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray_person,
                scaleFactor=1.1,
                minNeighbors=5,
                minSize=(30, 30)
            )

            # Get smoothed emotion
            smoothed_emotion, smoothed_conf = self.emotion_tracker.get_smoothed_emotion(
                tracker_id, current_time
            )

            # Store person data
            person_data = {
                'id': int(tracker_id),
                'bbox': [x1, y1, x2, y2],
                'emotion': smoothed_emotion,
                'confidence': float(smoothed_conf) if smoothed_conf else 0.0,
                'has_face': len(faces) > 0
            }

            # Determine box color
            if smoothed_emotion:
                box_color = self.emotion_colors.get(smoothed_emotion, (0, 255, 0))
            else:
                box_color = (0, 255, 0)

            # Draw person bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)

            # Draw person ID
            self.draw_label(frame, f'ID: {tracker_id}', (x1, y1), box_color)

            # Process faces
            for (fx, fy, fw, fh) in faces:
                face_x1 = x1 + fx
                face_y1 = y1 + fy
                face_x2 = face_x1 + fw
                face_y2 = face_y1 + fh

                # Extract face
                face_crop = frame[face_y1:face_y2, face_x1:face_x2]

                # Predict emotion
                raw_emotion, raw_confidence = self.get_emotion(face_crop)

                if raw_emotion:
                    # Add to tracker history
                    self.emotion_tracker.add_detection(
                        tracker_id, raw_emotion, raw_confidence, current_time
                    )

                    # Draw face rectangle
                    cv2.rectangle(frame, (face_x1, face_y1), (face_x2, face_y2), box_color, 1)

            # Display smoothed emotion
            if smoothed_emotion:
                label = f'{smoothed_emotion} ({smoothed_conf * 100:.0f}%)'
                self.draw_label(frame, label, (x1, y2 + 5), box_color)

            frame_data['people'].append(person_data)

        # Cleanup old trackers
        self.emotion_tracker.cleanup_old_trackers(current_time, timeout=10.0)

        return frame, frame_data

    def detection_loop(self):
        """Main detection loop running in separate thread"""
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

        if not cap.isOpened():
            print("Error: Could not open camera")
            return

        print("✓ Camera opened")

        while self.running:
            ret, frame = cap.read()
            if not ret:
                continue

            # Process frame (returns frame + data)
            processed_frame, frame_data = self.process_frame(frame)

            # Update current frame and data
            with self.frame_lock:
                self.current_frame = processed_frame
                self.current_data = frame_data

            time.sleep(0.033)  # ~30 fps

        cap.release()
        print("Camera closed")

    def start(self):
        """Start the detection system"""
        if self.running:
            return

        self.load_models()
        self.running = True
        self.detection_thread = Thread(target=self.detection_loop, daemon=True)
        self.detection_thread.start()
        print("✓ Detection system started")

    def stop(self):
        """Stop the detection system"""
        self.running = False
        if self.detection_thread:
            self.detection_thread.join(timeout=2)

    def get_current_frame_base64(self):
        """Get current frame as base64 JPEG"""
        with self.frame_lock:
            if self.current_frame is None:
                return None

            frame = self.current_frame.copy()

        # Encode as JPEG
        _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        jpg_base64 = base64.b64encode(buffer).decode('utf-8')

        return jpg_base64

    def get_current_data(self):
        """Get current emotion data for all tracked people"""
        with self.frame_lock:
            if self.current_data is None:
                return {'people': []}

            # Return a copy to avoid threading issues
            return {'people': self.current_data['people'][:]}

    async def register_client(self, websocket):
        """Register a WebSocket client"""
        self.clients.add(websocket)
        print(f"Client connected. Total clients: {len(self.clients)}")

    def unregister_client(self, websocket):
        """Unregister a WebSocket client"""
        self.clients.discard(websocket)
        print(f"Client disconnected. Total clients: {len(self.clients)}")


# ============================================
# GLOBAL BROADCASTER INSTANCE
# ============================================

broadcaster = EmotionDetectionBroadcaster()

# Don't auto-start - wait for first WebSocket connection


