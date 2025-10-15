from pydantic import BaseModel

class HealthStatus(BaseModel):
    status: str
    service: str
    version: str
    services: dict[str, str]
