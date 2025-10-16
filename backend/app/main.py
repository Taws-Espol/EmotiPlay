import time
from fastapi import FastAPI, Request
from app.core.settings import settings
from app.routers import emotion_detection, checkhealth
import logging
from app.services import spotify as spotify_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()


logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger("FastAPI")

app = FastAPI(
        title=settings.app_name,
        version=settings.version,
        debug=settings.debug,
        )

app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        )

@app.middleware("http")
async def log_request(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000

    logger.info( f"{request.method} {request.url.path} completed_in={process_time:.2f}ms status_code={response.status_code}" )
    return response

app.include_router(emotion_detection.router)
app.include_router(checkhealth.router)
app.include_router(spotify_router.router, prefix="/api/spotify", tags=["Spotify"])

@app.get("/")
async def root():
    return { "message": "Hola somos taws 😀" }
