from pydantic import BaseModel

class EmotionFrameRequest(BaseModel):
    frame: str

class EmotionDetectionResponse(BaseModel):
    emotion: str
    frame: str

class EmotionHistoryResponse(BaseModel):
    history: list[str]
