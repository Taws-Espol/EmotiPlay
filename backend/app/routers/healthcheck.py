from fastapi import APIRouter
from app.models.checkhealth_model import HealthStatus
from app.core.settings import settings

router = APIRouter(prefix="/api")

router.get(path="/checkhealth", response_model=HealthStatus)
async def check_health():
    return HealthStatus(
            status="ok",
            service="EmotiPlay-Backend",
            version=settings.version,
            )

