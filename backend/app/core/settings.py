from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "EmotiPlay"
    debug: bool = True
    version: str = "1.0"

    host: str = "0.0.0.0"
    port: int = 8000

    cors_allowed_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]


settings = Settings()
