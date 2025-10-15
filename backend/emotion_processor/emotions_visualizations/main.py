import cv2
import numpy as np


class EmotionsVisualization:
    def __init__(self):
        self.emotion_colors = {
                'happy': (255, 223, 0),
                'sad': (0, 102, 204),
                'angry': (204, 0, 0),
                'surprise': (255, 128, 0),
                'disgust': (0, 153, 0),
                'fear': (153, 51, 204)
                }

    def main(self, emotions: dict, original_image: np.ndarray):
        for i, (emotion, score) in enumerate(emotions.items()):
            cv2.putText(original_image, emotion, (10, 30 + i * 40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, self.emotion_colors[emotion], 1,
                        cv2.LINE_AA)
            cv2.rectangle(original_image, (150, 15 + i * 40), (150 + int(score * 2.5), 35 + i * 40), self.emotion_colors[emotion],
                          -1)
            cv2.rectangle(original_image, (150, 15 + i * 40), (400, 35 + i * 40), (255, 255, 255), 1)

        return original_image
