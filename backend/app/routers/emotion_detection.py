import asyncio
import base64
import cv2
import numpy as np
from fastapi import APIRouter, WebSocket
from app.services.emotion_detection_service import recognizer
from app.models.emotion_detection_model import EmotionDetectionResponse, EmotionFrameRequest, EmotionHistoryResponse
from pydantic import ValidationError

emotion_history = []

router = APIRouter(prefix="/api")

@router.websocket("/ws/emotions/detect")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                req = EmotionFrameRequest.model_validate_json(data)
            except ValidationError as e:
                await websocket.send_text(f"Invalid data {e}")
                continue

            frame_bytes = base64.b64decode(req.frame)
            np_arr = np.frombuffer(frame_bytes, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            processed_frame, emotion = await asyncio.to_thread(recognizer.frame_processing, frame)

            _, buffer = cv2.imencode(".jpg", processed_frame)
            encoded_frame = base64.b64encode(buffer).decode()
            res = EmotionDetectionResponse(emotion=emotion, frame=encoded_frame)
            await websocket.send_text(res.model_dump_json())
    except Exception as e:
        print("❌ WebSocket closed:", e)
        await websocket.close()

@router.get("/emotions/history", response_model=EmotionHistoryResponse)
async def history():
    return EmotionHistoryResponse( history=emotion_history )
