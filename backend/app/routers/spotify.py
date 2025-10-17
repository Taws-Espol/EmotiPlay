from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse, JSONResponse
import secrets
import os
import base64
import urllib.parse
import requests
from dotenv import load_dotenv
from app.services.spotify_service import make_spotify_api_request, find_spotify_device_id
from app.models.spotify_detection_model import PlaybackRequest

# Load environment
load_dotenv()

router = APIRouter()

client_id = os.getenv("SPOTIFY_CLIENT_ID")
client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")
redirect_uri = "http://127.0.0.1:8000/api/spotify/callback"

# In-memory store
oauth_states = {}
stored_access_token = None
default_device_id = None

playlist = {
        "happy": "uri_playlist_happy",
        "surprise": "uri_playlist_surprise",
        "sad": "uri_playlist_sad",
        "angry": "uri_playlist_angry",
        "disgust": "uri_playlist_disgust",
        "fear": "uri_playlist_fear"
        }

@router.get("/login")
def login():
    state = secrets.token_urlsafe(16)
    oauth_states[state] = True

    scope = "user-read-private user-read-email user-modify-playback-state user-read-playback-state"

    query_params = {
        "response_type": "code",
        "client_id": client_id,
        "scope": scope,
        "redirect_uri": redirect_uri,
        "state": state,
    }

    url = "https://accounts.spotify.com/authorize?" + urllib.parse.urlencode(query_params)
    return RedirectResponse(url)


@router.get("/callback")
def callback(request: Request):
    global stored_access_token

    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not state or state not in oauth_states:
        return JSONResponse(status_code=400, content={"error": "State mismatch"})

    oauth_states.pop(state)

    auth_str = f"{client_id}:{client_secret}"
    b64_auth = base64.b64encode(auth_str.encode()).decode()

    token_url = "https://accounts.spotify.com/api/token"

    data = {
        "code": code,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }

    headers = {
        "Authorization": f"Basic {b64_auth}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(token_url, data=data, headers=headers)

    if response.status_code != 200:
        return JSONResponse(status_code=response.status_code, content={"error": response.text})

    token_info = response.json()
    stored_access_token = token_info["access_token"]

    return JSONResponse(content={
        "message": "Authentication successful — token stored on server",
        "note": "You can now call /play and /pause without passing a token"
    })

@router.get("/devices")
def get_devices():
    global stored_access_token

    print("si esta funcionando")
    if not stored_access_token:
        return JSONResponse(status_code=401, content={"error": "Access token not available. Please login first."})


    response = make_spotify_api_request("GET", "/devices", stored_access_token)

    if response.status_code != 200:
        return JSONResponse(status_code=response.status_code, content={"error": response.text})

    return JSONResponse(content=response.json())

@router.post("/play")
def play_music(request: PlaybackRequest):
    global default_device_id

    emotion = request.emotion

    if not stored_access_token:
        return JSONResponse(status_code=401, content={"error": "Access token not available. Please login first."})

    if not default_device_id:
        default_device_id = find_spotify_device_id(stored_access_token)

    if not default_device_id:
        return JSONResponse(status_code=400, content={"error": "No available device found. Is spotifyd running?"})

    print(default_device_id)
    play_endpoint = f"/play?device_id={default_device_id}"

    play_data = {
            "context_uri": f"spotify:album:{playlist[emotion]}",
            "offset": {
                "position": 5
                },
            "position_ms": 0
            }

    response = make_spotify_api_request("PUT", play_endpoint, stored_access_token, play_data)

    if response.status_code not in [200, 204]:
        return JSONResponse(status_code=response.status_code, content={"error": response.text})

    return {"message": "Playback started or resumed"}


@router.get("/pause")
def pause_music():
    global default_device_id

    if not stored_access_token:
        return JSONResponse(status_code=401, content={"error": "Access token not available. Please login first."})

    if not default_device_id:
        default_device_id = find_spotify_device_id(stored_access_token)

    if not default_device_id:
        return JSONResponse(status_code=400, content={"error": "No available device found. Is spotifyd running?"})

    pause_endpoint = f"/pause?device_id={default_device_id}"


    response = make_spotify_api_request("PUT", pause_endpoint, stored_access_token)

    if response.status_code not in [200, 204]:
        return JSONResponse(status_code=response.status_code, content={"error": response.text})

    return {"message": "Playback paused"}
