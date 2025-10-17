# Documentación del Backend - EmotiPlay

## Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Módulos Principales](#módulos-principales)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [API de Uso](#api-de-uso)
6. [Flujo de Procesamiento](#flujo-de-procesamiento)
7. [Procesadores de Características](#procesadores-de-características)
8. [Sistema de Puntuación de Emociones](#sistema-de-puntuación-de-emociones)
9. [Ejemplos de Uso](#ejemplos-de-uso)
10. [Personalización y Extensión](#personalización-y-extensión)

## Descripción General

El backend de EmotiPlay es un sistema de reconocimiento de emociones faciales basado en Python que utiliza MediaPipe para la detección de puntos faciales y algoritmos personalizados para el análisis de características y clasificación de emociones.

### Características Principales

- **Detección en tiempo real**: Procesamiento de video a 30 FPS
- **468 puntos de referencia faciales**: Análisis detallado utilizando MediaPipe Face Mesh
- **6 emociones detectables**: Happy, Sad, Angry, Surprise, Disgust, Fear
- **Arquitectura modular**: Fácil de extender y personalizar
- **Procesamiento por características**: Análisis independiente de ojos, cejas, boca y nariz

## Arquitectura

```
backend/
├── emotion_processor/           # Paquete principal
│   ├── face_mesh/              # Detección de puntos faciales
│   │   ├── __init__.py
│   │   └── face_mesh_processor.py
│   │
│   ├── data_processing/        # Procesamiento de características
│   │   ├── __init__.py
│   │   ├── main.py             # Orquestador de procesadores
│   │   ├── feature_processor.py # Clase base abstracta
│   │   ├── eyes/               # Procesador de ojos
│   │   │   ├── eyes_processor.py
│   │   │   └── eyes_processing.py
│   │   ├── eyebrows/           # Procesador de cejas
│   │   │   ├── eyebrows_processor.py
│   │   │   └── eyebrows_processing.py
│   │   ├── mouth/              # Procesador de boca
│   │   │   ├── mouth_processor.py
│   │   │   └── mouth_processing.py
│   │   └── nose/               # Procesador de nariz
│   │       ├── nose_processor.py
│   │       └── nose_processing.py
│   │
│   ├── emotions_recognition/   # Reconocimiento de emociones
│   │   ├── __init__.py
│   │   ├── main.py             # Sistema de reconocimiento
│   │   ├── features/           # Sistema de características
│   │   │   ├── emotion_score.py        # Clase base
│   │   │   ├── feature_check.py        # Verificación de características
│   │   │   ├── feature_implementation.py # Implementación de features
│   │   │   └── weights_emotion_score.py  # Pesos de características
│   │   └── emotions/           # Calculadores de puntuación
│   │       ├── happy_score.py
│   │       ├── sad_score.py
│   │       ├── angry_score.py
│   │       ├── suprise_score.py
│   │       ├── disgust_score.py
│   │       └── fear_score.py
│   │
│   ├── emotions_visualizations/ # Visualización de resultados
│   │   ├── __init__.py
│   │   └── main.py
│   │
│   └── main.py                 # Sistema completo integrado
│
├── examples/                   # Ejemplos de uso
│   ├── camera.py              # Ejemplo con cámara en vivo
│   └── video_stream.py        # Ejemplo con video pregrabado
│
├── docs/                      # Recursos de documentación
│   └── images/                # Imágenes de referencia
│
├── requirements.txt           # Dependencias del proyecto
└── README.md                  # Documentación básica
```

## Módulos Principales

### 1. EmotionRecognitionSystem

**Ubicación**: `emotion_processor/main.py`

Clase principal que integra todos los componentes del sistema.

```python
from emotion_processor.main import EmotionRecognitionSystem

# Inicializar el sistema
system = EmotionRecognitionSystem()

# Procesar un frame
result_image = system.frame_processing(frame)
```

**Componentes integrados**:
- `FaceMeshProcessor`: Detección de rostro
- `PointsProcessing`: Procesamiento de características
- `EmotionRecognition`: Clasificación de emociones
- `EmotionsVisualization`: Visualización de resultados

### 2. FaceMeshProcessor

**Ubicación**: `emotion_processor/face_mesh/face_mesh_processor.py`

Gestiona la detección de puntos faciales usando MediaPipe.

```python
from emotion_processor.face_mesh.face_mesh_processor import FaceMeshProcessor

processor = FaceMeshProcessor()
face_points, success, image = processor.process(frame, draw=True)
```

**Funcionalidades**:
- Detección de 468 puntos de referencia faciales
- Extracción de características específicas (ojos, cejas, boca, nariz)
- Visualización opcional de la malla facial
- Normalización de coordenadas

**Puntos extraídos**:
```python
{
    'eyes': {
        'right_eye': [punto1, punto2, ...],
        'left_eye': [punto1, punto2, ...]
    },
    'eyebrows': {
        'right_eyebrow': [...],
        'left_eyebrow': [...]
    },
    'mouth': {
        'outer_lip': [...],
        'inner_lip': [...]
    },
    'nose': {
        'bridge': [...],
        'tip': [...]
    }
}
```

### 3. PointsProcessing

**Ubicación**: `emotion_processor/data_processing/main.py`

Orquestador que procesa las características faciales detectadas.

```python
from emotion_processor.data_processing.main import PointsProcessing

processor = PointsProcessing()
processed_features = processor.main(face_points)
```

**Procesadores incluidos**:
- `EyeBrowsProcessor`: Analiza elevación y ángulo de cejas
- `EyesProcessor`: Calcula apertura y forma de ojos
- `MouthProcessor`: Evalúa apertura y forma de boca
- `NoseProcessor`: Determina posición relativa de nariz

### 4. EmotionRecognition

**Ubicación**: `emotion_processor/emotions_recognition/main.py`

Sistema de clasificación que calcula puntuaciones para cada emoción.

```python
from emotion_processor.emotions_recognition.main import EmotionRecognition

recognizer = EmotionRecognition()
emotion_scores = recognizer.recognize_emotion(processed_features)
```

**Emociones detectadas**:
- `happy`: Felicidad
- `sad`: Tristeza
- `angry`: Enojo
- `surprise`: Sorpresa
- `disgust`: Disgusto
- `fear`: Miedo

**Formato de salida**:
```python
{
    'happy': 0.85,
    'sad': 0.12,
    'angry': 0.05,
    'surprise': 0.15,
    'disgust': 0.03,
    'fear': 0.08
}
```

### 5. EmotionsVisualization

**Ubicación**: `emotion_processor/emotions_visualizations/main.py`

Visualiza los resultados del reconocimiento sobre la imagen.

```python
from emotion_processor.emotions_visualizations.main import EmotionsVisualization

visualizer = EmotionsVisualization()
result_image = visualizer.main(emotion_scores, original_image)
```

## Instalación y Configuración

### Requisitos del Sistema

- Python 3.10 o superior
- Cámara web (para ejemplos en tiempo real)
- Sistema operativo: Windows, Linux o macOS

### Instalación

1. **Crear entorno virtual**:
```bash
cd backend
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

2. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

### Dependencias Principales

```
mediapipe==0.10.14      # Detección de malla facial
opencv-python==4.10.0   # Procesamiento de imágenes
numpy==2.0.0            # Operaciones numéricas
matplotlib              # Visualización de datos
scipy==1.14.0           # Operaciones científicas
fastapi                 # Framework para API REST
```

## API REST Endpoints

El backend proporciona una API REST construida con FastAPI para integración con el frontend y otras aplicaciones.

### Configuración del Servidor

**Iniciar el servidor**:
```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**URL base**: `http://localhost:8000`

**Spotify Redirect URI autorizada**: `http://localhost:8000/callback`

### 1. Health Check

Verifica el estado del servidor y servicios.

**Endpoint**: `GET /health`

**Descripción**: Verifica que el servidor esté funcionando y que los servicios de procesamiento estén listos.

**Request**:
```bash
curl -X GET http://localhost:8000/health
```

**Response** (200 OK):
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

**Response** (503 Service Unavailable):
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

### 2. Detección de Emociones - Imagen

Analiza una imagen estática y devuelve las emociones detectadas.

**Endpoint**: `POST /api/v1/detect/image`

**Descripción**: Recibe una imagen en formato base64 o multipart/form-data y retorna las emociones detectadas con sus puntuaciones.

**Content-Type**: `multipart/form-data` o `application/json`

**Request** (multipart/form-data):
```bash
curl -X POST http://localhost:8000/api/v1/detect/image \
  -F "image=@/path/to/image.jpg"
```

**Request** (JSON con base64):
```bash
curl -X POST http://localhost:8000/api/v1/detect/image \
  -H "Content-Type: application/json" \
  -d '{
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
  }'
```

**Response** (200 OK):
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

**Response** (400 Bad Request - No se detecta rostro):
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

**Response** (400 Bad Request - Imagen inválida):
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

### 3. Detección de Emociones - Video Stream

Analiza un stream de video en tiempo real.

**Endpoint**: `WebSocket /ws/detect/video`

**Descripción**: Establece una conexión WebSocket para streaming de video y recepción de emociones en tiempo real.

**Conexión**:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/detect/video');

ws.onopen = () => {
  console.log('Conexión establecida');
};

// Enviar frame
ws.send(JSON.stringify({
  type: 'frame',
  data: base64ImageData,
  timestamp: Date.now()
}));

// Recibir resultado
ws.onmessage = (event) => {
  const result = JSON.parse(event.data);
  console.log(result);
};
```

**Message enviado al servidor**:
```json
{
  "type": "frame",
  "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
  "timestamp": 1728648615234,
  "frame_number": 156
}
```

**Message recibido del servidor**:
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

**Message de error**:
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

**Control messages**:
```json
// Pausar procesamiento
{
  "type": "control",
  "action": "pause"
}

// Reanudar procesamiento
{
  "type": "control",
  "action": "resume"
}

// Cerrar conexión
{
  "type": "control",
  "action": "close"
}
```

### 4. Música Aleatoria

Obtiene una playlist aleatoria de Spotify.

**Endpoint**: `GET /api/v1/music/random`

**Descripción**: Devuelve una playlist aleatoria de una categoría variada de Spotify.

**Query Parameters**:
- `mood` (opcional): Filtrar por estado de ánimo (happy, sad, energetic, calm, focus)
- `limit` (opcional): Número de tracks a devolver (default: 20, max: 50)

**Request**:
```bash
curl -X GET "http://localhost:8000/api/v1/music/random?mood=happy&limit=10"
```

**Response** (200 OK):
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

**Response** (401 Unauthorized):
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

### 5. Cambio de Música por Emoción

Obtiene una playlist específica según la emoción detectada.

**Endpoint**: `POST /api/v1/music/emotion`

**Descripción**: Recibe una emoción y devuelve una playlist optimizada para ese estado emocional.

**Content-Type**: `application/json`

**Request**:
```bash
curl -X POST http://localhost:8000/api/v1/music/emotion \
  -H "Content-Type: application/json" \
  -d '{
    "emotion": "triste",
    "confianza": 0.7234,
    "user_preferences": {
      "language": "es",
      "intensity": "medium"
    }
  }'
```

**Request Body**:
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

**Response** (200 OK):
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

**Emociones soportadas**:
- `feliz` - Música energética y optimista
- `triste` - Música melancólica y reflexiva
- `enojado` - Música intensa o relajante para desahogo
- `sorprendido` - Música dinámica y variada
- `neutral` - Mix balanceado de varios géneros
- `amor` - Música romántica y emotiva

### 6. Historial de Emociones

Obtiene el historial de emociones detectadas en una sesión.

**Endpoint**: `GET /api/v1/history/emotions`

**Descripción**: Devuelve el historial de emociones detectadas con estadísticas agregadas.

**Query Parameters**:
- `session_id` (requerido): ID de la sesión
- `limit` (opcional): Número de registros (default: 50, max: 500)
- `from_timestamp` (opcional): Timestamp inicio en ISO 8601
- `to_timestamp` (opcional): Timestamp fin en ISO 8601

**Request**:
```bash
curl -X GET "http://localhost:8000/api/v1/history/emotions?session_id=abc123&limit=100"
```

**Response** (200 OK):
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

### Autenticación con Spotify

#### Iniciar autenticación

**Endpoint**: `GET /api/v1/auth/spotify`

**Response**:
```json
{
  "auth_url": "https://accounts.spotify.com/authorize?client_id=...&redirect_uri=http://localhost:8000/callback&scope=..."
}
```

#### Callback de autorización

**Endpoint**: `GET /callback`

**Query Parameters**:
- `code`: Código de autorización de Spotify
- `state`: Token de estado para validación

**Response**: Redirección al frontend con token de sesión

### Códigos de Error

| Código | Mensaje | Descripción |
|--------|---------|-------------|
| `NO_FACE_DETECTED` | No face detected | No se encontró ningún rostro en la imagen |
| `INVALID_IMAGE` | Invalid image format | Formato de imagen no soportado |
| `PROCESSING_ERROR` | Processing failed | Error durante el procesamiento |
| `SPOTIFY_AUTH_REQUIRED` | Spotify auth required | Se requiere autenticación con Spotify |
| `INVALID_SESSION` | Invalid session ID | ID de sesión no válido o expirado |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Límite de requests excedido |
| `INTERNAL_ERROR` | Internal server error | Error interno del servidor |

### Rate Limiting

- **General**: 100 requests por minuto por IP
- **Image Detection**: 30 requests por minuto por sesión
- **Music Endpoints**: 60 requests por minuto por sesión

**Response cuando se excede el límite** (429 Too Many Requests):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Límite de requests excedido",
    "retry_after": 45,
    "limit": 100,
    "remaining": 0
  }
}
```

## API de Uso

### Uso Básico

```python
import cv2
from emotion_processor.main import EmotionRecognitionSystem

# Inicializar sistema
system = EmotionRecognitionSystem()

# Capturar video
cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    # Procesar frame
    result = system.frame_processing(frame)

    # Mostrar resultado
    cv2.imshow('EmotiPlay', result)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```

### Uso Avanzado - Componentes Individuales

```python
from emotion_processor.face_mesh.face_mesh_processor import FaceMeshProcessor
from emotion_processor.data_processing.main import PointsProcessing
from emotion_processor.emotions_recognition.main import EmotionRecognition

# Inicializar componentes
face_mesh = FaceMeshProcessor()
data_processor = PointsProcessing()
emotion_recognizer = EmotionRecognition()

# Procesar frame
face_points, success, image = face_mesh.process(frame, draw=False)

if success:
    # Procesar características
    features = data_processor.main(face_points)

    # Reconocer emociones
    emotions = emotion_recognizer.recognize_emotion(features)

    # Obtener emoción dominante
    dominant_emotion = max(emotions.items(), key=lambda x: x[1])
    print(f"Emoción: {dominant_emotion[0]}, Confianza: {dominant_emotion[1]:.2f}")
```

## Flujo de Procesamiento

```
┌─────────────────┐
│  Frame de Video │
└────────┬────────┘
         │
         v
┌─────────────────────────┐
│  FaceMeshProcessor      │
│  - Detecta 468 puntos   │
│  - Extrae características│
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│  PointsProcessing       │
│  - EyeBrowsProcessor    │
│  - EyesProcessor        │
│  - MouthProcessor       │
│  - NoseProcessor        │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│  EmotionRecognition     │
│  - HappyScore           │
│  - SadScore             │
│  - AngryScore           │
│  - SurpriseScore        │
│  - DisgustScore         │
│  - FearScore            │
└────────┬────────────────┘
         │
         v
┌─────────────────────────┐
│  EmotionsVisualization  │
│  - Dibuja resultados    │
│  - Añade etiquetas      │
└────────┬────────────────┘
         │
         v
┌─────────────────┐
│  Frame Anotado  │
└─────────────────┘
```

## Procesadores de Características

### FeatureProcessor (Clase Base Abstracta)

**Ubicación**: `emotion_processor/data_processing/feature_processor.py`

Clase base que define la interfaz para todos los procesadores.

```python
from abc import ABC, abstractmethod

class FeatureProcessor(ABC):
    @abstractmethod
    def process(self, points: dict) -> dict:
        pass
```

### EyesProcessor

**Características calculadas**:
- Apertura del ojo derecho
- Apertura del ojo izquierdo
- Relación de aspecto del ojo (EAR)
- Asimetría entre ojos

**Métricas**:
```python
{
    'right_eye_opening': float,  # 0.0 (cerrado) - 1.0 (abierto)
    'left_eye_opening': float,
    'eye_asymmetry': float,
    'average_opening': float
}
```

### EyeBrowsProcessor

**Características calculadas**:
- Elevación de la ceja derecha
- Elevación de la ceja izquierda
- Ángulo de las cejas
- Distancia entre cejas

**Métricas**:
```python
{
    'right_eyebrow_raise': float,   # Elevación relativa
    'left_eyebrow_raise': float,
    'eyebrow_angle': float,         # Ángulo en grados
    'eyebrow_distance': float       # Distancia normalizada
}
```

### MouthProcessor

**Características calculadas**:
- Apertura vertical de la boca
- Apertura horizontal de la boca
- Curvatura de las comisuras
- Forma de los labios

**Métricas**:
```python
{
    'mouth_height': float,          # Apertura vertical
    'mouth_width': float,           # Apertura horizontal
    'mouth_aspect_ratio': float,    # Relación alto/ancho
    'smile_intensity': float,       # Curvatura hacia arriba
    'lip_compression': float        # Tensión de labios
}
```

### NoseProcessor

**Características calculadas**:
- Posición vertical de la nariz
- Orientación de la nariz
- Ancho de las fosas nasales

**Métricas**:
```python
{
    'nose_position': float,         # Posición relativa
    'nose_orientation': float,      # Ángulo
    'nostril_flare': float          # Dilatación de fosas
}
```

## Sistema de Puntuación de Emociones

### EmotionScore (Clase Base)

**Ubicación**: `emotion_processor/emotions_recognition/features/emotion_score.py`

Clase base abstracta para calculadores de puntuación.

```python
class EmotionScore(ABC):
    @abstractmethod
    def calculate_score(self, features: dict) -> dict:
        """
        Calcula la puntuación de la emoción basada en características

        Args:
            features: Diccionario con características procesadas

        Returns:
            dict: {'emotion_name': score}
        """
        pass
```

### Calculadores de Emociones

#### HappyScore (Felicidad)

**Características clave**:
- Boca sonriente (comisuras hacia arriba)
- Ojos ligeramente cerrados
- Mejillas elevadas

**Algoritmo**:
```python
happiness_score = (
    smile_intensity * 0.5 +
    eye_crinkle * 0.3 +
    cheek_raise * 0.2
)
```

#### SadScore (Tristeza)

**Características clave**:
- Comisuras de boca hacia abajo
- Cejas internas levantadas
- Párpados caídos

**Algoritmo**:
```python
sadness_score = (
    mouth_frown * 0.4 +
    inner_eyebrow_raise * 0.3 +
    eye_droop * 0.3
)
```

#### AngryScore (Enojo)

**Características clave**:
- Cejas fruncidas y bajadas
- Ojos entrecerrados
- Labios apretados

**Algoritmo**:
```python
anger_score = (
    eyebrow_lower * 0.4 +
    eye_squint * 0.3 +
    lip_press * 0.3
)
```

#### SurpriseScore (Sorpresa)

**Características clave**:
- Cejas elevadas
- Ojos muy abiertos
- Boca abierta

**Algoritmo**:
```python
surprise_score = (
    eyebrow_raise * 0.35 +
    eye_widening * 0.35 +
    mouth_open * 0.3
)
```

#### DisgustScore (Disgusto)

**Características clave**:
- Nariz arrugada
- Labio superior levantado
- Cejas ligeramente fruncidas

**Algoritmo**:
```python
disgust_score = (
    nose_wrinkle * 0.4 +
    upper_lip_raise * 0.4 +
    eyebrow_lower * 0.2
)
```

#### FearScore (Miedo)

**Características clave**:
- Cejas elevadas y juntas
- Ojos muy abiertos
- Boca ligeramente abierta y estirada

**Algoritmo**:
```python
fear_score = (
    eyebrow_raise_inner * 0.4 +
    eye_widening * 0.35 +
    mouth_stretch * 0.25
)
```

## Ejemplos de Uso

### Ejemplo 1: Cámara en Tiempo Real

**Archivo**: `examples/camera.py`

```python
import cv2
from emotion_processor.main import EmotionRecognitionSystem

def main():
    # Inicializar sistema
    system = EmotionRecognitionSystem()

    # Configurar cámara
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    print("Presiona 'q' para salir")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error al capturar frame")
            break

        # Procesar frame
        result = system.frame_processing(frame)

        # Mostrar resultado
        cv2.imshow('EmotiPlay - Emotion Recognition', result)

        # Salir con 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
```

### Ejemplo 2: Procesamiento de Video

**Archivo**: `examples/video_stream.py`

```python
import cv2
from emotion_processor.main import EmotionRecognitionSystem

def process_video(video_path, output_path=None):
    system = EmotionRecognitionSystem()
    cap = cv2.VideoCapture(video_path)

    # Obtener propiedades del video
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # Configurar escritor de video (opcional)
    if output_path:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    frame_count = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Procesar frame
        result = system.frame_processing(frame)

        # Guardar frame procesado
        if output_path:
            out.write(result)

        # Mostrar progreso
        frame_count += 1
        if frame_count % 30 == 0:
            print(f"Frames procesados: {frame_count}")

        # Mostrar resultado
        cv2.imshow('Processing', result)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    if output_path:
        out.release()
    cv2.destroyAllWindows()

    print(f"Total de frames procesados: {frame_count}")

if __name__ == "__main__":
    process_video('input_video.mp4', 'output_video.mp4')
```

### Ejemplo 3: Análisis de Imagen Estática

```python
import cv2
from emotion_processor.main import EmotionRecognitionSystem
from emotion_processor.emotions_recognition.main import EmotionRecognition

def analyze_image(image_path):
    # Cargar imagen
    image = cv2.imread(image_path)

    # Inicializar sistema
    system = EmotionRecognitionSystem()

    # Procesar imagen
    result = system.frame_processing(image)

    # Obtener puntuaciones detalladas
    face_points, success, _ = system.face_mesh.process(image)
    if success:
        features = system.data_processing.main(face_points)
        emotions = system.emotions_recognition.recognize_emotion(features)

        print("Puntuaciones de emociones:")
        for emotion, score in sorted(emotions.items(),
                                     key=lambda x: x[1],
                                     reverse=True):
            print(f"  {emotion}: {score:.2%}")

    # Mostrar resultado
    cv2.imshow('Result', result)
    cv2.waitKey(0)
    cv2.destroyAllWindows()

if __name__ == "__main__":
    analyze_image('portrait.jpg')
```

## Personalización y Extensión

### Crear un Nuevo Procesador de Características

```python
from emotion_processor.data_processing.feature_processor import FeatureProcessor

class CustomFeatureProcessor(FeatureProcessor):
    def process(self, points: dict) -> dict:
        """
        Procesa puntos específicos de una característica

        Args:
            points: Diccionario con puntos de la característica

        Returns:
            dict: Métricas calculadas
        """
        # Implementar lógica de procesamiento
        metrics = {}

        # Ejemplo: calcular alguna métrica
        if 'point1' in points and 'point2' in points:
            distance = self._calculate_distance(
                points['point1'],
                points['point2']
            )
            metrics['custom_metric'] = distance

        return metrics

    def _calculate_distance(self, p1, p2):
        return ((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)**0.5
```

### Agregar Nueva Emoción

1. **Crear clase de puntuación**:

```python
# backend/emotion_processor/emotions_recognition/emotions/custom_score.py

from emotion_processor.emotions_recognition.features.emotion_score import EmotionScore

class CustomEmotionScore(EmotionScore):
    def calculate_score(self, features: dict) -> dict:
        """
        Calcula puntuación para emoción personalizada
        """
        # Extraer características relevantes
        eyebrows = features.get('eyebrows', {})
        eyes = features.get('eyes', {})
        mouth = features.get('mouth', {})

        # Calcular puntuación basada en características
        score = 0.0

        # Ejemplo de lógica
        if eyebrows.get('right_eyebrow_raise', 0) > 0.5:
            score += 0.3

        if eyes.get('average_opening', 0) > 0.7:
            score += 0.4

        if mouth.get('smile_intensity', 0) > 0.6:
            score += 0.3

        return {'custom_emotion': min(score, 1.0)}
```

2. **Registrar en EmotionRecognition**:

```python
# backend/emotion_processor/emotions_recognition/main.py

from .emotions.custom_score import CustomEmotionScore

class EmotionRecognition:
    def __init__(self):
        self.emotions: Dict[str, EmotionScore] = {
            'surprise': SurpriseScore(),
            'angry': AngryScore(),
            # ... emociones existentes ...
            'custom_emotion': CustomEmotionScore(),  # Nueva emoción
        }
```

### Ajustar Pesos de Características

```python
# Modificar pesos en el calculador de emoción específico

class HappyScore(EmotionScore):
    def __init__(self):
        # Definir pesos personalizados
        self.weights = {
            'smile_intensity': 0.6,    # Aumentar importancia de sonrisa
            'eye_crinkle': 0.25,       # Reducir peso de ojos
            'cheek_raise': 0.15
        }

    def calculate_score(self, features: dict) -> dict:
        mouth = features.get('mouth', {})
        eyes = features.get('eyes', {})

        score = (
            mouth.get('smile_intensity', 0) * self.weights['smile_intensity'] +
            eyes.get('crinkle', 0) * self.weights['eye_crinkle'] +
            mouth.get('cheek_raise', 0) * self.weights['cheek_raise']
        )

        return {'happy': min(score, 1.0)}
```

## Optimización y Rendimiento

### Tips de Rendimiento

1. **Reducir resolución de entrada**:
```python
# Procesar a 640x480 en lugar de HD
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
```

2. **Saltar frames**:
```python
frame_skip = 2
frame_count = 0

while True:
    ret, frame = cap.read()
    frame_count += 1

    if frame_count % frame_skip != 0:
        continue

    result = system.frame_processing(frame)
```

3. **Deshabilitar visualización en procesamiento**:
```python
face_points, success, image = face_mesh.process(frame, draw=False)
```

### Benchmarks

**Hardware de referencia**: Intel i5 8th gen, 8GB RAM, sin GPU dedicada

| Resolución | FPS Promedio | Latencia |
|------------|--------------|----------|
| 640x480    | 30 FPS       | 33ms     |
| 1280x720   | 20 FPS       | 50ms     |
| 1920x1080  | 12 FPS       | 83ms     |

## Solución de Problemas

### Error: No se detecta el rostro

**Causas comunes**:
- Iluminación insuficiente
- Rostro parcialmente oculto
- Ángulo extremo de la cámara

**Solución**:
```python
# Verificar si se detectó rostro
face_points, success, image = face_mesh.process(frame)
if not success:
    print("No se detectó rostro")
    # Mostrar frame original sin procesar
    cv2.imshow('EmotiPlay', frame)
```

### Error: MediaPipe no funciona

```bash
# Reinstalar MediaPipe
pip uninstall mediapipe
pip install mediapipe==0.10.14

# Si persiste, instalar desde conda
conda install -c conda-forge mediapipe
```

### Bajo rendimiento

```python
# Optimizar detección
import mediapipe as mp

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    max_num_faces=1,              # Solo un rostro
    refine_landmarks=False,        # Sin refinamiento extra
    min_detection_confidence=0.5,  # Umbral más bajo
    min_tracking_confidence=0.5
)
```

## Contribuir al Backend

Para contribuir mejoras al backend:

1. Crear tests unitarios para nuevos procesadores
2. Documentar parámetros y valores de retorno
3. Mantener compatibilidad con la interfaz existente
4. Actualizar esta documentación con cambios significativos

## Referencias

- [MediaPipe Face Mesh](https://google.github.io/mediapipe/solutions/face_mesh.html)
- [OpenCV Documentation](https://docs.opencv.org/)
- [Facial Action Coding System (FACS)](https://en.wikipedia.org/wiki/Facial_Action_Coding_System)

---

**Última actualización**: 2025-10-11
