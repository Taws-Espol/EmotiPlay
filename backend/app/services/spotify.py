# services/spotify.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
import requests
import os
import base64
from dotenv import load_dotenv
load_dotenv()
from app.models.spotify_detection_model import PlaybackRequest

router = APIRouter()

# Variables de entorno
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
TOKEN_URL = "https://accounts.spotify.com/api/token"
AUTH_URL = "https://accounts.spotify.com/authorize"
# SCOPES necesarios para la reproducción
SCOPES = "user-read-private user-read-email user-modify-playback-state user-read-currently-playing"

EMOTION_TRACKS = {
    "happy": {
        "uri": "spotify:track:6OCjlzkYRKzBP0VEkD4xEg",  # "Walking on Sunshine" - Katrina & The Waves
        "name": "Walking on Sunshine",
        "artist": "Katrina & The Waves"
    },
    "sad": {
        "uri": "spotify:track:4TIqzdAssasqx3DAe6cG9J",  # "Someone Like You" - Adele
        "name": "Someone Like You",
        "artist": "Adele"
    },
    "angry": {
        "uri": "spotify:track:2QnyXB0uUGAeJNfHvPXZoT",  # "In The End" - Linkin Park
        "name": "In The End",
        "artist": "Linkin Park"
    },
    "calm": {
        "uri": "spotify:track:7MfwqAXzLRqX8H0UieI7Cr",  # "River Flows In You" - Yiruma
        "name": "River Flows In You",
        "artist": "Yiruma"
    },
    "excited": {
        "uri": "spotify:track:7dt6x5M1jzdTEt8oCbisTK",  # "Sweet Dreams (Are Made of This)" - Eurythmics
        "name": "Sweet Dreams (Are Made of This)",
        "artist": "Eurythmics"
    },
    "neutral": {
        "uri": "spotify:track:3cfOd4CMv2snFaKAnMdnvK",  # "Here Comes the Sun" - The Beatles
        "name": "Here Comes the Sun",
        "artist": "The Beatles"
    }
}

# --- ENDPOINTS de Autenticación OAuth 2.0 ---

# 1. GET /api/spotify/login - Iniciar proceso de autenticación OAuth
access_token = None

def get_access_token():
    """Obtiene un access token de Spotify usando el flujo de Client Credentials."""
    global access_token
    print(CLIENT_ID)
    # 1. Codificar Client ID y Client Secret en Base64 (Equivalente a btoa en JS)
    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    # Codificar la cadena de bytes y luego decodificar a una cadena de texto (string)
    encoded_auth = base64.b64encode(auth_str.encode()).decode()

    # 2. Definir cabeceras (headers)
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': f'Basic {encoded_auth}'
    }

    # 3. Definir cuerpo de la petición (body)
    data = {
        'grant_type': 'client_credentials'
    }

    # 4. Realizar la petición POST
    try:
        response = requests.post(TOKEN_URL, headers=headers, data=data)
        response.raise_for_status() # Lanza un error si el estado es 4xx o 5xx

        data = response.json()
        access_token = data.get('access_token')
        
        print(f"Token obtenido: {access_token[:20]}...")
        return access_token
        
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener el token: {e}")
        return None

@router.get("/token")
def fetch_token():
    """Obtiene un access token usando Client Credentials Flow."""
    token = get_access_token()
    if token:
        return {"access_token": token}
    else:
        raise HTTPException(status_code=500, detail="No se pudo obtener el token")
            
# 3. POST /api/spotify/token - Intercambiar código por access token

# 4. POST /api/spotify/refresh - Refrescar access token expirado
@router.post("/refresh")
def refresh_access_token(refresh_token: str):
    """Usa el refresh_token para obtener un nuevo access_token."""
    # Lógica de petición POST a Spotify Accounts API
    # ...
    # Placeholder:
    return {"access_token": "nuevo_access_token_refrescado"}


# --- ENDPOINTS de Funcionalidad ---

# Dependencia para simular la verificación del token y obtener el access_token
async def get_current_access_token(token: str = "token_de_prueba"):
    # En producción, esta función revisaría tu DB, verificaría expiración,
    # y refrescaría el token si es necesario antes de devolverlo.
    return token

# 5. GET /api/spotify/current-track - Obtener canción actual del usuario
@router.get("/current-track")
def get_current_track(token: str = Depends(get_current_access_token)):
    """Obtiene la canción que el usuario está escuchando actualmente."""
    # Lógica de petición GET a Spotify API con el token en el encabezado Authorization: Bearer
    # ...
    return {"track": "Song Title", "artist": "Artist Name"}

# 6. POST /api/spotify/play - Reproducir playlist/canción según emoción
@router.post("/play")
async def play_track(
    request_body: PlaybackRequest,
):
    """
    Reproduce una canción basada en la emoción proporcionada.
    
    Args:
        emotion (str): Una de las siguientes emociones: 'happy', 'sad', 'angry', 'calm', 'excited', 'neutral'
        token (str): Token de acceso de Spotify
    
    Returns:
        dict: Información sobre la canción reproducida
    """
    # Validar la emoción
    emotion = request_body.emotion.lower()
    if emotion not in EMOTION_TRACKS:
        raise HTTPException(
            status_code=400,
            detail=f"Emoción no válida. Opciones disponibles: {', '.join(EMOTION_TRACKS.keys())}"
        )
    
    track = EMOTION_TRACKS[emotion]
    
    # Preparar la petición a la API de Spotify
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    data = {
        "uris": [track["uri"]]
    }
    
    try:
        # Realizar la petición para reproducir la canción
        response = requests.put(
            "https://api.spotify.com/v1/me/player/play",
            headers=headers,
            json=data
        )
        
        if response.status_code == 204:
            return {
                "status": "success",
                "message": f"Reproduciendo canción para la emoción: {emotion}",
                "track": {
                    "name": track["name"],
                    "artist": track["artist"],
                    "uri": track["uri"]
                }
            }
        else:
            # Si hay un error, intentar obtener el mensaje de error
            error_detail = response.json().get("error", {}).get("message", "Error desconocido")
            raise HTTPException(status_code=response.status_code, detail=error_detail)
            
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error al comunicarse con Spotify: {str(e)}")

# 7. POST /api/spotify/pause - Pausar reproducción
@router.post("/pause")
def pause_playback(token: str = Depends(get_current_access_token)):
    """Pausa la reproducción actual del usuario."""
    # Lógica de petición PUT a Spotify API: /v1/me/player/pause
    # ...
    return {"status": "Reproducción pausada"}

# 8. POST /api/spotify/skip - Saltar a siguiente canción
@router.post("/skip")
def skip_track(token: str = Depends(get_current_access_token)):
    """Salta a la siguiente canción en la cola de reproducción."""
    # Lógica de petición POST a Spotify API: /v1/me/player/next
    # ...
    return {"status": "Saltando a la siguiente canción"}