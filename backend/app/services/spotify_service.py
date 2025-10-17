import requests

SPOTIFY_API_BASE = "https://api.spotify.com/v1/me/player"

def make_spotify_api_request(method: str, endpoint: str, token: str, json_data=None):
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    url = f"{SPOTIFY_API_BASE}{endpoint}"

    response = requests.request(method, url, headers=headers, json=json_data)
    return response

def find_spotify_device_id(token: str):
    response = make_spotify_api_request("GET", "/devices", token)

    if response.status_code == 200:
        devices = response.json().get("devices", [])
        if devices:
            first_device_id = devices[0]["id"]
            return first_device_id

    return None
