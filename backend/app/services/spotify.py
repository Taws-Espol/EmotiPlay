# services/spotify.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
import requests
import os
import base64

router = APIRouter()

# Variables de entorno
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("SPOTIFY_REDIRECT_URI")
# SCOPES necesarios para la reproducción
SCOPES = "user-read-private user-read-email user-modify-playback-state user-read-currently-playing"

# --- ENDPOINTS de Autenticación OAuth 2.0 ---

# 1. GET /api/spotify/login - Iniciar proceso de autenticación OAuth
@router.get("/login")
def login():
    """Inicia el proceso de autenticación de Spotify."""
    auth_url = (
        "https://accounts.spotify.com/authorize"
        f"client_id={CLIENT_ID}&"
        f"response_type=code&"
        f"redirect_uri={REDIRECT_URI}&"
        f"scope={SCOPES}"
    )
    return RedirectResponse(url=auth_url)

# 2. GET /api/spotify/callback - Callback de Spotify
@router.get("/callback")
def spotify_callback(code: str):
    """Recibe el código de autorización de Spotify y lo usa para obtener tokens."""
    # 1. Preparar la cabecera de autenticación (CLIENT_ID:CLIENT_SECRET)
    # Codificamos en Base64 la combinación de credenciales
    auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
    encoded_auth = base64.b64encode(auth_str.encode()).decode()
    
    headers = {
        'Authorization': f'Basic {encoded_auth}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    # 2. Preparar el cuerpo de la petición (data)
    data = {
        'grant_type': 'client_credentials',
        'code': code,
        'redirect_uri': REDIRECT_URI
    }

    # 3. Realizar la petición POST al endpoint de tokens de Spotify
    try:
        response = requests.post(
            'https://accounts.spotify.com/api/token', 
            headers=headers,
            data=data
        )
        response.raise_for_status()

        token_data = response.json()
        
        # --- LÓGICA CLAVE: DEVOLVER AMBOS TOKENS AL CLIENTE ---
        # El frontend (cliente) se encargará de guardar el access_token 
        # para enviarlo en las peticiones /play, /pause, etc.
        # También debe guardar el refresh_token para la ruta /refresh
        
        # NOTA: En un entorno de producción seguro, redirigirías al frontend
        # con estos tokens en la URL o cookies/storage.
        
        return {
            "message": "Autenticación de sesión exitosa.", 
            "access_token": token_data.get("access_token"),
            "refresh_token": token_data.get("refresh_token"),
            "expires_in": token_data.get("expires_in")
        }
        
    except requests.exceptions.HTTPError as e:
        error_details = e.response.json()
        raise HTTPException(status_code=400, detail=f"Error de Spotify: {error_details.get('error_description', e.response.text)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


# 3. POST /api/spotify/token - Intercambiar código por access token
@router.post("/token")
def exchange_code(code: str):
    """Intercambia el código de autorización por access_token y refresh_token."""
    # Lógica de petición POST a Spotify Accounts API (usando requests)
    # Aquí es donde obtienes y DEBES ALMACENAR los tokens
    # ...
    # Placeholder:
    return {"access_token": "nuevo_access_token", "refresh_token": "refresh_token_guardado"}

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
def play_track(
    emotion: str, # Ejemplo de parámetro que recibes para la lógica de selección de música
    token: str = Depends(get_current_access_token)
):
    """Reproduce música. La lógica interna seleccionaría la URI basada en la emoción."""
    # Lógica: Seleccionar URI de la canción/playlist basada en la 'emotion'
    # Lógica de petición PUT a Spotify API: /v1/me/player/play
    # ...
    return {"status": f"Reproducción solicitada para la emoción: {emotion}"}

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