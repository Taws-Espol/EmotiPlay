# API REST Endpoints - EmotiPlay Backend

Documentación completa de los endpoints de la API REST del backend de EmotiPlay.

## Información General

**URL Base**: `http://localhost:8000`

**Versión de API**: `v1`

**Formato de respuesta**: JSON

**Spotify Redirect URI**: `http://localhost:8000/callback`

## Tabla de Contenidos

1. [Health Check](#1-health-check)
2. [Detección de Emociones - Imagen](#2-detección-de-emociones---imagen)
3. [Detección de Emociones - Video Stream](#3-detección-de-emociones---video-stream)
4. [Música Aleatoria](#4-música-aleatoria)
5. [Cambio de Música por Emoción](#5-cambio-de-música-por-emoción)
6. [Historial de Emociones](#6-historial-de-emociones)
7. [Autenticación con Spotify](#7-autenticación-con-spotify)
8. [Códigos de Error](#códigos-de-error)
9. [Rate Limiting](#rate-limiting)

## Inicio Rápido

### Instalación de Dependencias

```bash
cd backend
pip install -r requirements.txt
```

### Iniciar el Servidor

```bash
uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

El servidor estará disponible en `http://localhost:8000`

### Documentación Interactiva

Una vez iniciado el servidor, puedes acceder a:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 1. Health Check

Verifica el estado del servidor y los servicios de procesamiento.

### Endpoint

```
GET /health
```

### Descripción

Retorna el estado de salud del servidor, incluyendo el estado de los servicios de reconocimiento de emociones, integración con Spotify y carga de MediaPipe.

### Request

```bash
curl -X GET http://localhost:8000/health
```

### Response Exitosa (200 OK)

```json
{
  "status": "healthy",
  "service": "EmotiPlay Backend API",
  "version": "1.0.0",
  "timestamp": "2025-10-11T10:30:00Z",
  "services": {
    "emotion_recognition": "operational",
    "spotify_integration": "operational",
    "mediapipe": "loaded"
  }
}
```

### Response con Error (503 Service Unavailable)

```json
{
  "status": "unhealthy",
  "service": "EmotiPlay Backend API",
  "version": "1.0.0",
  "timestamp": "2025-10-11T10:30:00Z",
  "services": {
    "emotion_recognition": "error",
    "spotify_integration": "operational",
    "mediapipe": "failed_to_load"
  },
  "error": "MediaPipe initialization failed"
}
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `status` | string | Estado general: "healthy" o "unhealthy" |
| `service` | string | Nombre del servicio |
| `version` | string | Versión de la API |
| `timestamp` | string | Timestamp en formato ISO 8601 |
| `services` | object | Estado de cada servicio individual |
| `error` | string | Mensaje de error (solo si unhealthy) |

---

## 2. Detección de Emociones - Imagen

Analiza una imagen estática y devuelve las emociones detectadas con sus puntuaciones.

### Endpoint

```
POST /api/v1/detect/image
```

### Descripción

Recibe una imagen en formato multipart/form-data o JSON con base64 y retorna la emoción detectada, confianza, puntuaciones de todas las emociones y características faciales extraídas.

### Content-Type

- `multipart/form-data`
- `application/json`

### Request (multipart/form-data)

```bash
curl -X POST http://localhost:8000/api/v1/detect/image \
  -F "image=@/path/to/image.jpg"
```

### Request (JSON con base64)

```bash
curl -X POST http://localhost:8000/api/v1/detect/image \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
  }'
```

### Request Body (JSON)

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
}
```

### Response Exitosa (200 OK)

```json
{
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "processing_time_ms": 45.3,
  "detection": {
    "face_detected": true,
    "clase": "feliz",
    "confianza": 0.8547,
    "scores": {
      "happy": 0.8547,
      "surprise": 0.2134,
      "sad": 0.0823,
      "angry": 0.0512,
      "disgust": 0.0234,
      "fear": 0.0189
    }
  },
  "features": {
    "eyes": {
      "right_eye_opening": 0.7234,
      "left_eye_opening": 0.7189,
      "eye_asymmetry": 0.0045,
      "average_opening": 0.7211
    },
    "eyebrows": {
      "right_eyebrow_raise": 0.1234,
      "left_eyebrow_raise": 0.1189,
      "eyebrow_angle": 5.234,
      "eyebrow_distance": 0.4521
    },
    "mouth": {
      "mouth_height": 0.2134,
      "mouth_width": 0.6234,
      "mouth_aspect_ratio": 0.3423,
      "smile_intensity": 0.8123,
      "lip_compression": 0.1234
    },
    "nose": {
      "nose_position": 0.5012,
      "nose_orientation": 0.0234,
      "nostril_flare": 0.1123
    }
  },
  "metadata": {
    "image_resolution": {
      "width": 640,
      "height": 480
    },
    "face_landmarks_count": 468
  }
}
```

### Response - No se detecta rostro (400 Bad Request)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "NO_FACE_DETECTED",
    "message": "No se detectó ningún rostro en la imagen",
    "details": "Asegúrese de que la imagen contenga un rostro visible y bien iluminado"
  }
}
```

### Response - Imagen inválida (400 Bad Request)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "INVALID_IMAGE",
    "message": "Formato de imagen no válido",
    "details": "Formatos soportados: JPEG, PNG, WebP"
  }
}
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Indica si la operación fue exitosa |
| `timestamp` | string | Timestamp en formato ISO 8601 |
| `processing_time_ms` | float | Tiempo de procesamiento en milisegundos |
| `detection.clase` | string | Emoción detectada (feliz, triste, enojado, etc.) |
| `detection.confianza` | float | Nivel de confianza (0.0 - 1.0) |
| `detection.scores` | object | Puntuaciones de todas las emociones |
| `features` | object | Características faciales extraídas |
| `metadata` | object | Información adicional de la imagen |

### Formatos de Imagen Soportados

- JPEG / JPG
- PNG
- WebP

### Tamaño Máximo

- 10 MB por imagen

---

## 3. Detección de Emociones - Video Stream

Establece una conexión WebSocket para streaming de video y recepción de emociones en tiempo real.

### Endpoint

```
WebSocket /ws/detect/video
```

### Descripción

Permite enviar frames de video en tiempo real y recibir análisis de emociones de forma continua con baja latencia.

### Conexión (JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/detect/video');

ws.onopen = () => {
  console.log('Conexión WebSocket establecida');
};

ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  console.log('Emoción detectada:', result);
};

ws.onerror = (error) => {
  console.error('Error en WebSocket:', error);
};

ws.onclose = () => {
  console.log('Conexión WebSocket cerrada');
};
```

### Enviar Frame al Servidor

```javascript
// Capturar frame del video
const canvas = document.createElement('canvas');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0);

// Convertir a base64
const base64Image = canvas.toDataURL('image/jpeg', 0.8);

// Enviar al servidor
ws.send(JSON.stringify({
  type: 'frame',
  data: base64Image,
  timestamp: Date.now(),
  frame_number: frameCount
}));
```

### Mensaje Enviado al Servidor

```json
{
  "type": "frame",
  "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  "timestamp": 1728648615234,
  "frame_number": 156
}
```

### Mensaje Recibido del Servidor - Emoción Detectada

```json
{
  "type": "emotion_result",
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "frame_number": 156,
  "detection": {
    "face_detected": true,
    "clase": "sorprendido",
    "confianza": 0.7823,
    "scores": {
      "surprise": 0.7823,
      "happy": 0.1234,
      "fear": 0.0989,
      "angry": 0.0456,
      "sad": 0.0234,
      "disgust": 0.0123
    }
  },
  "processing_time_ms": 28.7
}
```

### Mensaje de Error

```json
{
  "type": "error",
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "PROCESSING_ERROR",
    "message": "Error al procesar el frame",
    "details": "Frame corrupto o formato inválido"
  }
}
```

### Mensajes de Control

#### Pausar Procesamiento

```json
{
  "type": "control",
  "action": "pause"
}
```

#### Reanudar Procesamiento

```json
{
  "type": "control",
  "action": "resume"
}
```

#### Cerrar Conexión

```json
{
  "type": "control",
  "action": "close"
}
```

### Tipos de Mensajes

| Tipo | Dirección | Descripción |
|------|-----------|-------------|
| `frame` | Cliente → Servidor | Frame de video para analizar |
| `emotion_result` | Servidor → Cliente | Resultado del análisis |
| `error` | Servidor → Cliente | Error en el procesamiento |
| `control` | Cliente → Servidor | Comando de control |

### Rendimiento

- **Latencia**: < 50ms por frame
- **Frames por segundo**: Hasta 30 FPS
- **Timeout de conexión**: 5 minutos sin actividad

---

## 4. Música Aleatoria

Obtiene una playlist aleatoria de Spotify filtrada opcionalmente por estado de ánimo.

### Endpoint

```
GET /api/v1/music/random
```

### Descripción

Devuelve una playlist aleatoria de Spotify con tracks, información de la playlist y metadatos.

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `mood` | string | No | Filtrar por estado de ánimo |
| `limit` | integer | No | Número de tracks (default: 20, max: 50) |

### Valores de Mood

- `happy` - Música alegre y energética
- `sad` - Música melancólica
- `energetic` - Música de alta energía
- `calm` - Música relajante
- `focus` - Música para concentración

### Request

```bash
curl -X GET "http://localhost:8000/api/v1/music/random?mood=happy&limit=10"
```

### Response Exitosa (200 OK)

```json
{
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "playlist": {
    "id": "37i9dQZF1DXdPec7aLTmlC",
    "name": "Happy Hits",
    "description": "Hits to boost your mood and fill you with happiness!",
    "mood": "happy",
    "image_url": "https://i.scdn.co/image/ab67706f00000002...",
    "total_tracks": 50,
    "tracks": [
      {
        "id": "3n3Ppam7vgaVa1iaRUc9Lp",
        "name": "Mr. Brightside",
        "artists": ["The Killers"],
        "album": "Hot Fuss",
        "duration_ms": 222973,
        "preview_url": "https://p.scdn.co/mp3-preview/...",
        "spotify_url": "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
      },
      {
        "id": "60nZcImufyMA1MKQY3dcCH",
        "name": "Uptown Funk",
        "artists": ["Mark Ronson", "Bruno Mars"],
        "album": "Uptown Special",
        "duration_ms": 269733,
        "preview_url": "https://p.scdn.co/mp3-preview/...",
        "spotify_url": "https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH"
      }
    ]
  },
  "metadata": {
    "total_returned": 10,
    "has_more": true
  }
}
```

### Response - Autenticación Requerida (401 Unauthorized)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "SPOTIFY_AUTH_REQUIRED",
    "message": "Autenticación con Spotify requerida",
    "auth_url": "http://localhost:8000/api/v1/auth/spotify"
  }
}
```

---

## 5. Cambio de Música por Emoción

Obtiene una playlist optimizada según la emoción detectada y preferencias del usuario.

### Endpoint

```
POST /api/v1/music/emotion
```

### Descripción

Recibe una emoción detectada junto con preferencias opcionales del usuario y retorna una playlist de Spotify optimizada para ese estado emocional.

### Content-Type

```
application/json
```

### Request

```bash
curl -X POST http://localhost:8000/api/v1/music/emotion \
  -H "Content-Type: application/json" \
  -d '{
    "emotion": "triste",
    "confianza": 0.7234,
    "user_preferences": {
      "language": "es",
      "intensity": "medium",
      "genres": ["pop", "indie", "acoustic"]
    }
  }'
```

### Request Body

```json
{
  "emotion": "triste",
  "confianza": 0.7234,
  "user_preferences": {
    "language": "es",
    "intensity": "medium",
    "genres": ["pop", "indie", "acoustic"]
  }
}
```

### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `emotion` | string | Sí | Emoción detectada |
| `confianza` | float | Sí | Nivel de confianza (0.0 - 1.0) |
| `user_preferences` | object | No | Preferencias del usuario |
| `user_preferences.language` | string | No | Idioma preferido (es, en, etc.) |
| `user_preferences.intensity` | string | No | Intensidad (low, medium, high) |
| `user_preferences.genres` | array | No | Géneros musicales preferidos |

### Emociones Soportadas

| Emoción | Descripción |
|---------|-------------|
| `feliz` | Música energética y optimista |
| `triste` | Música melancólica y reflexiva |
| `enojado` | Música intensa o relajante para desahogo |
| `sorprendido` | Música dinámica y variada |
| `neutral` | Mix balanceado de varios géneros |
| `amor` | Música romántica y emotiva |

### Response Exitosa (200 OK)

```json
{
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "emotion_detected": "triste",
  "confianza": 0.7234,
  "playlist": {
    "id": "37i9dQZF1DX7qK8ma5wgG1",
    "name": "Life Sucks",
    "description": "Feeling blue? Here's music to match your mood.",
    "emotion": "sad",
    "mood_match_score": 0.8923,
    "image_url": "https://i.scdn.co/image/ab67706f00000002...",
    "total_tracks": 75,
    "tracks": [
      {
        "id": "5CQ30WqJwcep0pYcV4AMNc",
        "name": "Someone Like You",
        "artists": ["Adele"],
        "album": "21",
        "duration_ms": 285000,
        "valence": 0.234,
        "energy": 0.312,
        "preview_url": "https://p.scdn.co/mp3-preview/...",
        "spotify_url": "https://open.spotify.com/track/5CQ30WqJwcep0pYcV4AMNc"
      },
      {
        "id": "0nJW01T7XtvILxQgC5J7Wh",
        "name": "The Night We Met",
        "artists": ["Lord Huron"],
        "album": "Strange Trails",
        "duration_ms": 208000,
        "valence": 0.189,
        "energy": 0.276,
        "preview_url": "https://p.scdn.co/mp3-preview/...",
        "spotify_url": "https://open.spotify.com/track/0nJW01T7XtvILxQgC5J7Wh"
      }
    ]
  },
  "recommendation_reason": "Seleccionada por intensidad emocional y preferencias de usuario",
  "metadata": {
    "total_tracks": 20,
    "avg_valence": 0.245,
    "avg_energy": 0.298
  }
}
```

### Campos de Respuesta

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `emotion_detected` | string | Emoción procesada |
| `confianza` | float | Confianza de la detección |
| `playlist.mood_match_score` | float | Qué tan bien coincide con la emoción (0-1) |
| `tracks[].valence` | float | Positividad musical (0-1) |
| `tracks[].energy` | float | Intensidad de la música (0-1) |
| `recommendation_reason` | string | Razón de la recomendación |

---

## 6. Historial de Emociones

Obtiene el historial completo de emociones detectadas en una sesión con estadísticas agregadas.

### Endpoint

```
GET /api/v1/history/emotions
```

### Descripción

Retorna el historial de emociones detectadas durante una sesión específica, incluyendo timeline completo, distribución de emociones, estadísticas y playlists reproducidas.

### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `session_id` | string | Sí | ID de la sesión |
| `limit` | integer | No | Número de registros (default: 50, max: 500) |
| `from_timestamp` | string | No | Timestamp inicio (ISO 8601) |
| `to_timestamp` | string | No | Timestamp fin (ISO 8601) |

### Request

```bash
curl -X GET "http://localhost:8000/api/v1/history/emotions?session_id=abc123&limit=100"
```

### Request con Filtros de Tiempo

```bash
curl -X GET "http://localhost:8000/api/v1/history/emotions?session_id=abc123&from_timestamp=2025-10-11T10:00:00Z&to_timestamp=2025-10-11T11:00:00Z&limit=200"
```

### Response Exitosa (200 OK)

```json
{
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "session_id": "abc123",
  "period": {
    "start": "2025-10-11T10:00:00.000Z",
    "end": "2025-10-11T10:30:00.000Z",
    "duration_minutes": 30
  },
  "statistics": {
    "total_detections": 450,
    "emotion_distribution": {
      "feliz": 187,
      "neutral": 143,
      "sorprendido": 56,
      "triste": 34,
      "enojado": 21,
      "amor": 9
    },
    "emotion_percentages": {
      "feliz": 41.56,
      "neutral": 31.78,
      "sorprendido": 12.44,
      "triste": 7.56,
      "enojado": 4.67,
      "amor": 2.0
    },
    "dominant_emotion": "feliz",
    "average_confidence": 0.7823,
    "emotion_changes": 45,
    "longest_emotion_streak": {
      "emotion": "feliz",
      "duration_seconds": 180,
      "count": 90
    }
  },
  "timeline": [
    {
      "timestamp": "2025-10-11T10:00:12.234Z",
      "clase": "feliz",
      "confianza": 0.8234,
      "scores": {
        "happy": 0.8234,
        "surprise": 0.1234,
        "neutral": 0.0823,
        "sad": 0.0234,
        "angry": 0.0123,
        "disgust": 0.0089
      }
    },
    {
      "timestamp": "2025-10-11T10:00:14.456Z",
      "clase": "feliz",
      "confianza": 0.8456,
      "scores": {
        "happy": 0.8456,
        "surprise": 0.0923,
        "neutral": 0.0734,
        "sad": 0.0198,
        "angry": 0.0134,
        "disgust": 0.0076
      }
    }
  ],
  "playlists_played": [
    {
      "emotion": "feliz",
      "playlist_id": "37i9dQZF1DXdPec7aLTmlC",
      "playlist_name": "Happy Hits",
      "played_at": "2025-10-11T10:00:15.000Z",
      "duration_minutes": 12.5
    }
  ],
  "metadata": {
    "total_returned": 100,
    "has_more": true,
    "next_cursor": "eyJsYXN0X3RpbWVzdGFtcCI6MTcyODY0ODYxNTIzNH0="
  }
}
```

### Response - Sesión Inválida (404 Not Found)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "INVALID_SESSION",
    "message": "Sesión no encontrada",
    "details": "El session_id proporcionado no existe o ha expirado"
  }
}
```

### Campos de Estadísticas

| Campo | Descripción |
|-------|-------------|
| `total_detections` | Total de emociones detectadas |
| `emotion_distribution` | Conteo de cada emoción |
| `emotion_percentages` | Porcentaje de cada emoción |
| `dominant_emotion` | Emoción más frecuente |
| `average_confidence` | Confianza promedio |
| `emotion_changes` | Número de cambios de emoción |
| `longest_emotion_streak` | Racha más larga de una emoción |

---

## 7. Autenticación y Control de Spotify

Endpoints para gestionar la autenticación OAuth con Spotify y controlar la reproducción de música.

### Mapeo de Emociones a Géneros Spotify

| Emoción | Géneros/Estilos | Características Audio |
|---------|----------------|----------------------|
| `feliz` | Pop, Dance, Funk | Valence > 0.7, Energy > 0.6 |
| `triste` | Indie, Acoustic, Piano | Valence < 0.3, Energy < 0.4 |
| `enojado` | Rock, Metal, Hip-Hop | Energy > 0.8, Loudness > -5dB |
| `sorprendido` | Electronic, Experimental | Variedad alta, BPM variado |
| `neutral` | Lo-Fi, Chill, Ambient | Valence ~0.5, Energy ~0.5 |
| `amor` | Romantic, R&B, Soul | Valence 0.5-0.7, Acousticness > 0.4 |

### 7.1. Iniciar Autenticación OAuth

Inicia el proceso de autenticación OAuth 2.0 con Spotify.

#### Endpoint

```http
GET /api/spotify/login
```

#### Descripción

Genera una URL de autenticación de Spotify con los permisos necesarios y redirige al usuario al flujo de autorización.

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `redirect_after` | string | No | URL para redirección después de auth exitosa |

#### Request

```bash
curl -X GET "http://localhost:8000/api/spotify/login?redirect_after=/dashboard"
```

#### Response (200 OK)

```json
{
  "success": true,
  "auth_url": "https://accounts.spotify.com/authorize?client_id=abc123&redirect_uri=http://localhost:8000/api/spotify/callback&scope=user-read-playback-state+user-modify-playback-state+user-read-currently-playing+playlist-read-private+streaming&response_type=code&state=xyz789abc&show_dialog=true",
  "state": "xyz789abc",
  "scopes": [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "playlist-read-private",
    "streaming"
  ]
}
```

#### Scopes Solicitados

- `user-read-playback-state`: Leer estado de reproducción
- `user-modify-playback-state`: Controlar reproducción
- `user-read-currently-playing`: Ver canción actual
- `playlist-read-private`: Acceder a playlists privadas
- `streaming`: Reproducción web

### 7.2. Callback de Autorización

Recibe el código de autorización de Spotify después de que el usuario autoriza la aplicación.

#### Endpoint

```http
GET /api/spotify/callback
```

#### Descripción

Endpoint de callback configurado en Spotify Dashboard. Procesa el código de autorización y redirige al usuario.

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `code` | string | Sí | Código de autorización de Spotify |
| `state` | string | Sí | Token de estado para validación CSRF |
| `error` | string | No | Error de autorización (si falla) |

#### Request

```bash
# Este endpoint es llamado automáticamente por Spotify
# http://localhost:8000/api/spotify/callback?code=AQD...&state=xyz789abc
```

#### Response (302 Redirect)

**Autorización exitosa**:

```http
Location: http://localhost:3000/?session_token=abc123xyz&spotify_connected=true&user_id=spotify_user_123
Set-Cookie: spotify_session=abc123xyz; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

**Error de autorización**:

```http
Location: http://localhost:3000/?error=access_denied&message=User+denied+authorization
```

### 7.3. Intercambiar Código por Token

Intercambia el código de autorización por un access token y refresh token.

#### Endpoint

```http
POST /api/spotify/token
```

#### Descripción

Endpoint interno que intercambia el código de autorización OAuth por tokens de acceso. Usado automáticamente después del callback.

#### Content-Type

```http
application/json
```

#### Request

```bash
curl -X POST http://localhost:8000/api/spotify/token \
  -H "Content-Type: application/json" \
  -d '{
    "code": "AQD...",
    "state": "xyz789abc"
  }'
```

#### Request Body

```json
{
  "code": "AQD...",
  "state": "xyz789abc"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "session": {
    "session_id": "sess_abc123xyz",
    "user_id": "spotify_user_123",
    "expires_at": "2025-10-11T11:30:15.234Z"
  },
  "spotify": {
    "access_token": "BQD...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "AQC...",
    "scope": "user-read-playback-state user-modify-playback-state"
  },
  "user_profile": {
    "display_name": "Juan Pérez",
    "email": "juan@example.com",
    "country": "MX",
    "product": "premium",
    "images": [
      {
        "url": "https://i.scdn.co/image/...",
        "height": 300,
        "width": 300
      }
    ]
  }
}
```

#### Response (400 Bad Request - Código Inválido)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "INVALID_AUTH_CODE",
    "message": "Código de autorización inválido o expirado",
    "details": "El código proporcionado no es válido o ya fue utilizado",
    "spotify_error": "invalid_grant"
  }
}
```

#### Response (400 Bad Request - Estado Inválido)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "INVALID_STATE",
    "message": "Token de estado inválido",
    "details": "Posible ataque CSRF detectado"
  }
}
```

### 7.4. Refrescar Access Token

Obtiene un nuevo access token usando el refresh token cuando el token actual expira.

#### Endpoint

```http
POST /api/spotify/refresh
```

#### Descripción

Refresca el access token de Spotify cuando expira (cada 1 hora). El sistema hace esto automáticamente, pero también puede ser llamado manualmente.

#### Headers

```http
Authorization: Bearer {session_token}
```

#### Request

```bash
curl -X POST http://localhost:8000/api/spotify/refresh \
  -H "Authorization: Bearer sess_abc123xyz"
```

#### Response (200 OK)

```json
{
  "success": true,
  "timestamp": "2025-10-11T11:30:15.234Z",
  "spotify": {
    "access_token": "BQD_new_token...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "scope": "user-read-playback-state user-modify-playback-state"
  },
  "session_updated": true,
  "expires_at": "2025-10-11T12:30:15.234Z"
}
```

#### Response (401 Unauthorized - Refresh Token Inválido)

```json
{
  "success": false,
  "timestamp": "2025-10-11T11:30:15.234Z",
  "error": {
    "code": "INVALID_REFRESH_TOKEN",
    "message": "Refresh token inválido o expirado",
    "details": "El usuario debe volver a autenticarse",
    "action_required": "reauth",
    "auth_url": "/api/spotify/login"
  }
}
```

#### Response (429 Too Many Requests - Rate Limit Spotify)

```json
{
  "success": false,
  "timestamp": "2025-10-11T11:30:15.234Z",
  "error": {
    "code": "SPOTIFY_RATE_LIMIT",
    "message": "Rate limit de Spotify excedido",
    "details": "Demasiados intentos de refresh",
    "retry_after": 30,
    "spotify_error": "rate_limit_exceeded"
  }
}
```

### 7.5. Obtener Canción Actual

Obtiene información sobre la canción que el usuario está reproduciendo actualmente en Spotify.

#### Endpoint

```http
GET /api/spotify/current-track
```

#### Descripción

Retorna información detallada sobre la canción que se está reproduciendo actualmente en cualquier dispositivo del usuario.

#### Headers

```http
Authorization: Bearer {session_token}
```

#### Request

```bash
curl -X GET http://localhost:8000/api/spotify/current-track \
  -H "Authorization: Bearer sess_abc123xyz"
```

#### Response (200 OK - Reproduciendo)

```json
{
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "is_playing": true,
  "currently_playing_type": "track",
  "track": {
    "id": "3n3Ppam7vgaVa1iaRUc9Lp",
    "name": "Mr. Brightside",
    "artists": [
      {
        "id": "0C0XlULifJtAgn6ZNCW2eu",
        "name": "The Killers"
      }
    ],
    "album": {
      "id": "4piJq7R3gjUOxnYs6lDCTg",
      "name": "Hot Fuss",
      "images": [
        {
          "url": "https://i.scdn.co/image/...",
          "height": 640,
          "width": 640
        }
      ],
      "release_date": "2004-06-15"
    },
    "duration_ms": 222973,
    "explicit": false,
    "preview_url": "https://p.scdn.co/mp3-preview/...",
    "spotify_url": "https://open.spotify.com/track/3n3Ppam7vgaVa1iaRUc9Lp"
  },
  "progress_ms": 45230,
  "progress_percentage": 20.28,
  "playback": {
    "device": {
      "id": "abc123device",
      "name": "MacBook Pro",
      "type": "Computer",
      "volume_percent": 75,
      "is_active": true
    },
    "shuffle_state": false,
    "repeat_state": "off",
    "context": {
      "type": "playlist",
      "uri": "spotify:playlist:37i9dQZF1DXdPec7aLTmlC"
    }
  },
  "audio_features": {
    "valence": 0.682,
    "energy": 0.891,
    "danceability": 0.512,
    "tempo": 148.013,
    "key": 1,
    "mode": 1,
    "loudness": -4.772
  }
}
```

#### Response (200 OK - No Reproduciendo)

```json
{
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "is_playing": false,
  "message": "No hay reproducción activa",
  "last_played": {
    "track_name": "Mr. Brightside",
    "artists": ["The Killers"],
    "played_at": "2025-10-11T10:25:00.000Z"
  }
}
```

#### Response (401 Unauthorized)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "SPOTIFY_AUTH_REQUIRED",
    "message": "Autenticación con Spotify requerida",
    "details": "El usuario no ha autorizado la aplicación",
    "action_required": "auth",
    "auth_url": "/api/spotify/login"
  }
}
```

### 7.6. Reproducir Música por Emoción

Inicia la reproducción de una playlist o tracks en Spotify según la emoción detectada.

#### Endpoint

```http
POST /api/spotify/play
```

#### Descripción

Reproduce música en el dispositivo activo del usuario basándose en la emoción detectada. Selecciona automáticamente la playlist más adecuada.

#### Headers

```http
Authorization: Bearer {session_token}
Content-Type: application/json
```

#### Request

```bash
curl -X POST http://localhost:8000/api/spotify/play \
  -H "Authorization: Bearer sess_abc123xyz" \
  -H "Content-Type: application/json" \
  -d '{
    "emotion": "feliz",
    "confianza": 0.8547,
    "device_id": "abc123device",
    "user_preferences": {
      "language": "es",
      "genres": ["pop", "rock"]
    }
  }'
```

#### Request Body

```json
{
  "emotion": "feliz",
  "confianza": 0.8547,
  "device_id": "abc123device",
  "user_preferences": {
    "language": "es",
    "genres": ["pop", "rock"],
    "exclude_explicit": false
  }
}
```

#### Campos del Request

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `emotion` | string | Sí | Emoción detectada |
| `confianza` | float | No | Confianza de la detección (0-1) |
| `device_id` | string | No | ID del dispositivo (usa activo si no se especifica) |
| `user_preferences` | object | No | Preferencias del usuario |

#### Response (200 OK)

```json
{
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "playback_started": true,
  "emotion": "feliz",
  "playlist": {
    "id": "37i9dQZF1DXdPec7aLTmlC",
    "name": "Happy Hits",
    "description": "Hits to boost your mood!",
    "uri": "spotify:playlist:37i9dQZF1DXdPec7aLTmlC",
    "image_url": "https://i.scdn.co/image/...",
    "tracks_count": 50,
    "mood_match_score": 0.9123
  },
  "device": {
    "id": "abc123device",
    "name": "MacBook Pro",
    "type": "Computer",
    "volume_percent": 75
  },
  "now_playing": {
    "track_name": "Happy",
    "artists": ["Pharrell Williams"],
    "duration_ms": 233000
  }
}
```

#### Response (404 Not Found - Sin Dispositivo)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "NO_ACTIVE_DEVICE",
    "message": "No hay dispositivos de Spotify activos",
    "details": "Abre Spotify en algún dispositivo para iniciar la reproducción",
    "available_devices": []
  }
}
```

#### Response (403 Forbidden - Usuario No Premium)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "PREMIUM_REQUIRED",
    "message": "Spotify Premium requerido",
    "details": "La reproducción remota requiere una cuenta Spotify Premium",
    "spotify_error": "premium_required",
    "user_product": "free"
  }
}
```

#### Response (500 Internal Error - Spotify API Error)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "SPOTIFY_API_ERROR",
    "message": "Error de la API de Spotify",
    "details": "No se pudo iniciar la reproducción",
    "spotify_error": {
      "status": 500,
      "message": "Internal server error"
    },
    "retry": true
  }
}
```

### 7.7. Pausar Reproducción

Pausa la reproducción actual del usuario en Spotify.

#### Endpoint

```http
POST /api/spotify/pause
```

#### Descripción

Pausa la reproducción en el dispositivo activo del usuario.

#### Headers

```http
Authorization: Bearer {session_token}
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `device_id` | string | No | ID del dispositivo (usa activo si no se especifica) |

#### Request

```bash
curl -X POST "http://localhost:8000/api/spotify/pause?device_id=abc123device" \
  -H "Authorization: Bearer sess_abc123xyz"
```

#### Response (200 OK)

```json
{
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "playback_paused": true,
  "device": {
    "id": "abc123device",
    "name": "MacBook Pro",
    "type": "Computer"
  },
  "track_paused_at": {
    "track_name": "Happy",
    "artists": ["Pharrell Williams"],
    "progress_ms": 125000,
    "duration_ms": 233000
  }
}
```

#### Response (400 Bad Request - Ya Pausado)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "ALREADY_PAUSED",
    "message": "La reproducción ya está pausada",
    "details": "No hay reproducción activa para pausar"
  }
}
```

### 7.8. Saltar a Siguiente Canción

Salta a la siguiente canción en la cola de reproducción.

#### Endpoint

```http
POST /api/spotify/skip
```

#### Descripción

Salta a la siguiente canción en la cola o playlist actual del usuario.

#### Headers

```http
Authorization: Bearer {session_token}
```

#### Query Parameters

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `device_id` | string | No | ID del dispositivo |
| `direction` | string | No | Dirección: "next" o "previous" (default: "next") |

#### Request

```bash
curl -X POST "http://localhost:8000/api/spotify/skip?direction=next" \
  -H "Authorization: Bearer sess_abc123xyz"
```

#### Response (200 OK)

```json
{
  "success": true,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "track_skipped": true,
  "direction": "next",
  "previous_track": {
    "name": "Happy",
    "artists": ["Pharrell Williams"]
  },
  "now_playing": {
    "id": "60nZcImufyMA1MKQY3dcCH",
    "name": "Uptown Funk",
    "artists": ["Mark Ronson", "Bruno Mars"],
    "duration_ms": 269733,
    "album": {
      "name": "Uptown Special",
      "images": [
        {
          "url": "https://i.scdn.co/image/...",
          "height": 640,
          "width": 640
        }
      ]
    }
  },
  "device": {
    "id": "abc123device",
    "name": "MacBook Pro"
  }
}
```

#### Response (404 Not Found - Sin Cola)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "NO_NEXT_TRACK",
    "message": "No hay siguiente canción",
    "details": "La cola de reproducción está vacía o llegó al final"
  }
}
```

### Gestión de Tokens

#### Almacenamiento Temporal

Los tokens se almacenan de forma segura en el servidor con las siguientes características:

- **Access Token**: Válido por 1 hora
- **Refresh Token**: Válido hasta que el usuario revoca el acceso
- **Session Token**: Válido por 24 horas
- **Encriptación**: Tokens encriptados en reposo con AES-256
- **Almacenamiento**: Redis para caché, PostgreSQL para persistencia

#### Refresh Automático

El sistema refresca automáticamente el access token:

```python
# Pseudo-código del flujo de refresh automático
def check_and_refresh_token(session_token):
    session = get_session(session_token)

    # Verificar si el token expira en los próximos 5 minutos
    if session.expires_in < 300:
        new_tokens = spotify.refresh_access_token(session.refresh_token)
        update_session_tokens(session_token, new_tokens)

    return session.access_token
```

### Manejo de Errores de Spotify API

#### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "SPOTIFY_UNAUTHORIZED",
    "message": "Token de Spotify inválido",
    "action": "refresh_or_reauth",
    "spotify_error": "invalid_token"
  }
}
```

**Acción**: Intentar refresh automáticamente, si falla → reautenticar

#### 429 Rate Limit

```json
{
  "success": false,
  "error": {
    "code": "SPOTIFY_RATE_LIMIT",
    "message": "Rate limit de Spotify excedido",
    "retry_after": 30,
    "spotify_error": {
      "status": 429,
      "message": "Rate limit exceeded"
    }
  }
}
```

**Acción**: Esperar `retry_after` segundos antes de reintentar

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": {
    "code": "SPOTIFY_SERVER_ERROR",
    "message": "Error del servidor de Spotify",
    "retry": true,
    "max_retries": 3,
    "spotify_error": "internal_error"
  }
}
```

**Acción**: Reintentar con backoff exponencial (1s, 2s, 4s)

---

## Códigos de Error

Todos los errores siguen el siguiente formato:

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "ERROR_CODE",
    "message": "Mensaje descriptivo del error",
    "details": "Información adicional sobre el error"
  }
}
```

### Lista de Códigos

| Código | HTTP Status | Mensaje | Descripción |
|--------|-------------|---------|-------------|
| `NO_FACE_DETECTED` | 400 | No face detected | No se encontró ningún rostro en la imagen |
| `INVALID_IMAGE` | 400 | Invalid image format | Formato de imagen no soportado |
| `IMAGE_TOO_LARGE` | 400 | Image too large | Imagen excede el tamaño máximo (10MB) |
| `PROCESSING_ERROR` | 500 | Processing failed | Error durante el procesamiento de la imagen |
| `SPOTIFY_AUTH_REQUIRED` | 401 | Spotify auth required | Se requiere autenticación con Spotify |
| `INVALID_SESSION` | 404 | Invalid session ID | ID de sesión no válido o expirado |
| `INVALID_EMOTION` | 400 | Invalid emotion | Emoción no reconocida |
| `MISSING_PARAMETER` | 400 | Missing required parameter | Falta un parámetro requerido |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests | Límite de requests excedido |
| `INTERNAL_ERROR` | 500 | Internal server error | Error interno del servidor |
| `SERVICE_UNAVAILABLE` | 503 | Service unavailable | Servicio temporalmente no disponible |

---

## Rate Limiting

El sistema implementa rate limiting para prevenir abuso y garantizar disponibilidad.

### Límites por Endpoint

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| General | 100 requests | 1 minuto |
| `/api/v1/detect/image` | 30 requests | 1 minuto |
| `/api/v1/detect/video` (WebSocket) | 1 conexión | Por sesión |
| `/api/v1/music/*` | 60 requests | 1 minuto |
| `/api/v1/history/*` | 30 requests | 1 minuto |

### Response cuando se excede el límite (429)

```json
{
  "success": false,
  "timestamp": "2025-10-11T10:30:15.234Z",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Límite de requests excedido",
    "retry_after": 45,
    "limit": 100,
    "remaining": 0,
    "reset_at": "2025-10-11T10:31:00Z"
  }
}
```

### Headers de Rate Limit

Todas las respuestas incluyen headers informativos:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1728648660
```

---

## Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Detección

```javascript
// 1. Verificar salud del servidor
const healthCheck = await fetch('http://localhost:8000/health');
const health = await healthCheck.json();
console.log('Estado del servidor:', health.status);

// 2. Capturar imagen de la cámara
const canvas = document.createElement('canvas');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0);

// 3. Enviar imagen para análisis
const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
const formData = new FormData();
formData.append('image', blob);

const response = await fetch('http://localhost:8000/api/v1/detect/image', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Emoción detectada:', result.detection.clase);
console.log('Confianza:', result.detection.confianza);

// 4. Obtener música según la emoción
const musicResponse = await fetch('http://localhost:8000/api/v1/music/emotion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    emotion: result.detection.clase,
    confianza: result.detection.confianza
  })
});

const playlist = await musicResponse.json();
console.log('Playlist recomendada:', playlist.playlist.name);
```

### Ejemplo 2: Conexión WebSocket

```javascript
let ws = null;
let frameCount = 0;

function connectWebSocket() {
  ws = new WebSocket('ws://localhost:8000/ws/detect/video');

  ws.onopen = () => {
    console.log('WebSocket conectado');
    startVideoStream();
  };

  ws.onmessage = (event) => {
    const result = JSON.parse(event.data);

    if (result.type === 'emotion_result') {
      updateUI(result.detection);
    } else if (result.type === 'error') {
      console.error('Error:', result.error.message);
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket desconectado');
  };
}

function sendFrame() {
  if (ws.readyState === WebSocket.OPEN) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const base64 = canvas.toDataURL('image/jpeg', 0.8);

    ws.send(JSON.stringify({
      type: 'frame',
      data: base64,
      timestamp: Date.now(),
      frame_number: frameCount++
    }));
  }
}

// Enviar frames cada 100ms (10 FPS)
setInterval(sendFrame, 100);
```

### Ejemplo 3: Obtener Historial con Python

```python
import requests

session_id = "abc123"
url = f"http://localhost:8000/api/v1/history/emotions"

params = {
    "session_id": session_id,
    "limit": 100
}

response = requests.get(url, params=params)
data = response.json()

if data["success"]:
    stats = data["statistics"]
    print(f"Total de detecciones: {stats['total_detections']}")
    print(f"Emoción dominante: {stats['dominant_emotion']}")
    print(f"Confianza promedio: {stats['average_confidence']:.2%}")

    print("\nDistribución de emociones:")
    for emotion, percentage in stats["emotion_percentages"].items():
        print(f"  {emotion}: {percentage:.2f}%")
else:
    print(f"Error: {data['error']['message']}")
```

---

## Notas Adicionales

### Seguridad

- Todas las conexiones deben usar HTTPS en producción
- Los tokens de sesión expiran después de 24 horas
- Las credenciales de Spotify nunca se almacenan en el servidor
- Rate limiting protege contra abuso

### Rendimiento

- Las imágenes se procesan en ~45ms en promedio
- WebSocket tiene latencia < 50ms
- El servidor puede manejar hasta 100 conexiones simultáneas
- Las respuestas incluyen headers de caché cuando es apropiado

### Soporte

Para reportar problemas o sugerencias:

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/EmotiPlay/issues)
- **Email**: soporte@emotiplay.com
- **Documentación**: [Docs completas](./BACKEND_DOCS.md)

---

**Última actualización**: 2025-10-11

**Versión de la API**: 1.0.0
