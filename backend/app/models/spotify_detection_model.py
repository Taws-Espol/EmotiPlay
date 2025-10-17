from pydantic import BaseModel

class PlaybackRequest(BaseModel):
    emotion: str