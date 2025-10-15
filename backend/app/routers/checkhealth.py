from fastapi import APIRouter
from app.models.checkhealth_model import HealthStatus
from app.core.settings import settings
from app.services.checkhealth_service import *

router = APIRouter(prefix="/api")

@router.get(path="/health", response_model=HealthStatus)
async def check_health():
    return HealthStatus(
            status="ok",
            service="EmotiPlay Backend",
            version=settings.version,
            services={"emotion_recognition": is_emotion_recognition_ok(), "spotify_integration": is_spotify_ok(), "mediapipe": is_mediapipe_loaded(),}
            )

