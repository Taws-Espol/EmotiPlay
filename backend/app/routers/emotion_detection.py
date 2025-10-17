import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.models.emotion_detection_model import EmotionHistoryResponse
from model.emotion_detector import broadcaster

emotion_history = []

router = APIRouter(prefix="/api")


@router.websocket("/ws/emotions/detect")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time emotion detection stream

    Auto-starts detection on first connection.
    Auto-stops when all clients disconnect.

    Sends frames as JSON with base64-encoded JPEG:
    {
        "type": "frame",
        "data": "base64_jpeg_string",
        "timestamp": 1234567890.123,
        "active_tracks": 2,
        "total_clients": 1
    }
    """
    await websocket.accept()

    # Start detection if this is the first client
    if len(broadcaster.clients) == 0:
        print("First client connected - starting detection system...")
        broadcaster.start()

    await broadcaster.register_client(websocket)

    try:
        # Keep connection alive and send frames
        while True:
            frame_base64 = broadcaster.get_current_frame_base64()
            emotion_data = broadcaster.get_current_data()

            if frame_base64:
                # Sort emotions by ID
                emotions_list = sorted(emotion_data.get('people', []), key=lambda x: x['id'])

                await websocket.send_json({
                    "frame": frame_base64,
                    "emotions": emotions_list,
                    "timestamp": asyncio.get_event_loop().time(),
                    "active_tracks": len(broadcaster.emotion_tracker.last_seen) if broadcaster.emotion_tracker else 0,
                    "total_clients": len(broadcaster.clients)
                })

            await asyncio.sleep(0.033)

    except WebSocketDisconnect:
        broadcaster.unregister_client(websocket)
        print("Client disconnected normally")

    except Exception as e:
        broadcaster.unregister_client(websocket)
        print(f"WebSocket error: {e}")

    finally:
        # Stop detection if no more clients
        if len(broadcaster.clients) == 0:
            print("Last client disconnected - stopping detection system...")
            broadcaster.stop()


@router.get("/emotions/history", response_model=EmotionHistoryResponse)
async def history():
    return EmotionHistoryResponse(history=emotion_history)
