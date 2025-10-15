import asyncio
import base64
import cv2
import numpy as np
import logging
from fastapi import APIRouter, WebSocket
from starlette.websockets import WebSocketDisconnect
from app.services.emotion_detection_service import recognizer
from app.models.emotion_detection_model import EmotionDetectionResponse, EmotionFrameRequest, EmotionHistoryResponse
from pydantic import ValidationError

emotion_history = []

router = APIRouter(prefix="/api")

logger = logging.getLogger("emotion_ws")
logging.basicConfig(level=logging.INFO)

@router.websocket("/ws/emotions/detect")
async def websocket_endpoint(websocket: WebSocket):
    client = websocket.client
    logger.info("WebSocket: new connection attempt from %s", client)
    await websocket.accept()
    logger.info("WebSocket: connection accepted for %s", client)
    try:
        while True:
            try:
                data = await websocket.receive_text()
            except WebSocketDisconnect:
                logger.info("WebSocket disconnected by client %s", client)
                break
            except Exception as e:
                logger.exception("Error receiving data from websocket (will close loop)")
                break

            try:
                req = EmotionFrameRequest.model_validate_json(data)
            except ValidationError as e:
                # Responder con mensaje de error pero no intentar cerrar socket aquí
                await websocket.send_text(f"Invalid data {e}")
                continue

            # Procesar frame de forma segura en hilo separado
            try:
                frame_bytes = base64.b64decode(req.frame)
                np_arr = np.frombuffer(frame_bytes, np.uint8)
                frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                processed_frame, emotion = await asyncio.to_thread(recognizer.frame_processing, frame)

                _, buffer = cv2.imencode(".jpg", processed_frame)
                encoded_frame = base64.b64encode(buffer).decode()
                res = EmotionDetectionResponse(emotion=emotion, frame=encoded_frame)
                await websocket.send_text(res.model_dump_json())
            except Exception:
                logger.exception("Error procesando frame; enviando mensaje de error si la conexión sigue abierta")
                try:
                    await websocket.send_text("Internal server error processing frame")
                except Exception:
                    # Si enviar falla, probablemente la conexión esté cerrada: salimos del loop
                    logger.debug("No se pudo enviar mensaje de error; la conexión parece cerrada")
                    break
    finally:
        # Intentar cerrar de forma silenciosa sólo si es necesario
        try:
            await websocket.close()
        except Exception:
            logger.debug("websocket.close() falló o la conexión ya estaba cerrada", exc_info=True)

@router.get("/emotions/history", response_model=EmotionHistoryResponse)
async def history():
    return EmotionHistoryResponse( history=emotion_history )
