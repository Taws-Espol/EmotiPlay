# Arquitectura del Sistema - EmotiPlay

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Flujo de Datos](#flujo-de-datos)
4. [Componentes del Sistema](#componentes-del-sistema)
5. [Pipeline de Procesamiento](#pipeline-de-procesamiento)
6. [Integración Frontend-Backend](#integración-frontend-backend)
7. [Modelos de Datos](#modelos-de-datos)
8. [Escalabilidad y Rendimiento](#escalabilidad-y-rendimiento)
9. [Seguridad](#seguridad)
10. [Arquitectura Futura](#arquitectura-futura)

## Visión General

EmotiPlay es un sistema de reconocimiento de emociones faciales que combina procesamiento de video en tiempo real con inteligencia artificial para detectar emociones y adaptar la reproducción musical. El sistema está diseñado con una arquitectura modular que separa claramente las responsabilidades entre el procesamiento de emociones (backend) y la interfaz de usuario (frontend).

### Características Arquitectónicas Clave

- **Modularidad**: Componentes independientes y reutilizables
- **Separación de responsabilidades**: Backend y frontend claramente diferenciados
- **Procesamiento en tiempo real**: Análisis de video a 30 FPS
- **Escalabilidad horizontal**: Diseño preparado para múltiples instancias
- **Bajo acoplamiento**: Interfaces bien definidas entre módulos

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────┐
│                         EMOTIPLAY SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────────────┐         ┌──────────────────────────┐ │
│  │    FRONTEND (React)   │         │   BACKEND (Python)       │ │
│  │  ┌─────────────────┐  │         │  ┌────────────────────┐ │ │
│  │  │ Emotion         │  │         │  │ Face Detection     │ │ │
│  │  │ Recognition UI  │  │   HTTP  │  │ (MediaPipe)        │ │ │
│  │  └────────┬────────┘  │◄───────►│  └─────────┬──────────┘ │ │
│  │           │           │         │            │            │ │
│  │  ┌────────▼────────┐  │         │  ┌─────────▼──────────┐ │ │
│  │  │ Spotify Player  │  │         │  │ Feature Processing │ │ │
│  │  └────────┬────────┘  │         │  └─────────┬──────────┘ │ │
│  │           │           │         │            │            │ │
│  │  ┌────────▼────────┐  │         │  ┌─────────▼──────────┐ │ │
│  │  │ Visualization   │  │         │  │ Emotion Recognition│ │ │
│  │  │ Components      │  │         │  └─────────┬──────────┘ │ │
│  │  └─────────────────┘  │         │            │            │ │
│  │                       │         │  ┌─────────▼──────────┐ │ │
│  └───────────────────────┘         │  │ Visualization      │ │ │
│                                     │  └────────────────────┘ │ │
│                                     └──────────────────────────┘ │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │ Spotify API  │    │ MediaPipe ML │    │ Browser      │      │
│  │ (Planned)    │    │ Models       │    │ WebRTC       │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### Flujo de Procesamiento Completo

```
┌──────────────┐
│ User Camera  │
└──────┬───────┘
       │ Video Stream
       ▼
┌──────────────┐
│  Frontend    │
│  (Browser)   │
└──────┬───────┘
       │ Video Frames (Future: via API)
       ▼
┌──────────────────────────────────────────────────┐
│              BACKEND PROCESSING                   │
│                                                   │
│  1. Face Mesh Detection                          │
│     ├─ MediaPipe FaceMesh                        │
│     └─ Extract 468 landmarks                     │
│         │                                         │
│         ▼                                         │
│  2. Feature Extraction                           │
│     ├─ Eyes: Opening, asymmetry                  │
│     ├─ Eyebrows: Raise, angle                    │
│     ├─ Mouth: Opening, smile intensity           │
│     └─ Nose: Position, flare                     │
│         │                                         │
│         ▼                                         │
│  3. Emotion Classification                       │
│     ├─ Calculate scores for 6 emotions           │
│     ├─ Weight-based algorithm                    │
│     └─ Confidence calculation                    │
│         │                                         │
│         ▼                                         │
│  4. Visualization                                │
│     ├─ Overlay results on frame                  │
│     └─ Add emotion labels                        │
│                                                   │
└────────────────────┬──────────────────────────────┘
                     │ Emotion Data + Annotated Frame
                     ▼
┌──────────────────────────────────────────────────┐
│              FRONTEND RENDERING                   │
│                                                   │
│  1. Display Video Feed                           │
│  2. Update Current Emotion                       │
│  3. Update History                               │
│  4. Update Charts                                │
│  5. Trigger Spotify Playlist Change              │
│                                                   │
└──────────────────────────────────────────────────┘
```

### Flujo de Detección de Emociones (Detallado)

```
Frame Input
    │
    ▼
┌─────────────────────┐
│ FaceMeshProcessor   │
│                     │
│ process(frame)      │
│  ├─ Detect face     │
│  ├─ Extract 468pts  │
│  └─ Organize points │
└──────────┬──────────┘
           │ face_points = {
           │   'eyes': {...},
           │   'eyebrows': {...},
           │   'mouth': {...},
           │   'nose': {...}
           │ }
           ▼
┌─────────────────────┐
│ PointsProcessing    │
│                     │
│ main(face_points)   │
│  ├─ EyesProcessor   │
│  ├─ EyebrowsProc.   │
│  ├─ MouthProcessor  │
│  └─ NoseProcessor   │
└──────────┬──────────┘
           │ processed_features = {
           │   'eyes': {
           │     'right_eye_opening': 0.8,
           │     'left_eye_opening': 0.75,
           │     ...
           │   },
           │   'eyebrows': {...},
           │   'mouth': {...},
           │   'nose': {...}
           │ }
           ▼
┌─────────────────────┐
│ EmotionRecognition  │
│                     │
│ recognize_emotion() │
│  ├─ HappyScore      │
│  ├─ SadScore        │
│  ├─ AngryScore      │
│  ├─ SurpriseScore   │
│  ├─ DisgustScore    │
│  └─ FearScore       │
└──────────┬──────────┘
           │ emotion_scores = {
           │   'happy': 0.85,
           │   'sad': 0.12,
           │   'angry': 0.05,
           │   'surprise': 0.15,
           │   'disgust': 0.03,
           │   'fear': 0.08
           │ }
           ▼
┌─────────────────────┐
│ EmotionsVisual.     │
│                     │
│ main(scores, img)   │
│  └─ Draw overlay    │
└──────────┬──────────┘
           │
           ▼
    Annotated Frame
```

## Componentes del Sistema

### Backend Components

#### 1. Face Mesh Layer

```python
┌─────────────────────────────────────────────┐
│         FaceMeshProcessor                   │
├─────────────────────────────────────────────┤
│ Responsabilidades:                          │
│ • Detectar rostros en frames               │
│ • Extraer 468 puntos faciales              │
│ • Normalizar coordenadas                   │
│ • Organizar puntos por característica      │
│                                             │
│ Dependencias:                               │
│ • MediaPipe FaceMesh                       │
│ • OpenCV                                    │
│ • NumPy                                     │
│                                             │
│ Salidas:                                    │
│ • face_points: dict                        │
│ • success: bool                            │
│ • annotated_image: np.ndarray             │
└─────────────────────────────────────────────┘
```

#### 2. Feature Processing Layer

```python
┌────────────────────────────────────────────┐
│          PointsProcessing                  │
├────────────────────────────────────────────┤
│ Procesadores:                              │
│ ┌────────────────────────────────────────┐ │
│ │ EyesProcessor                          │ │
│ │ • Calcula apertura                     │ │
│ │ • Detecta asimetría                    │ │
│ │ • Mide relación de aspecto             │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ EyebrowsProcessor                      │ │
│ │ • Mide elevación                       │ │
│ │ • Calcula ángulo                       │ │
│ │ • Detecta fruncimiento                 │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ MouthProcessor                         │ │
│ │ • Analiza apertura                     │ │
│ │ • Detecta sonrisa                      │ │
│ │ • Mide compresión labial               │ │
│ └────────────────────────────────────────┘ │
│ ┌────────────────────────────────────────┐ │
│ │ NoseProcessor                          │ │
│ │ • Calcula posición                     │ │
│ │ • Detecta ensanchamiento               │ │
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

#### 3. Emotion Recognition Layer

```python
┌────────────────────────────────────────────┐
│       EmotionRecognition                   │
├────────────────────────────────────────────┤
│ Calculadores de Puntuación:                │
│                                             │
│ HappyScore:                                │
│   score = smile * 0.5 +                   │
│           eye_crinkle * 0.3 +             │
│           cheek_raise * 0.2               │
│                                             │
│ SadScore:                                  │
│   score = mouth_frown * 0.4 +             │
│           inner_brow_raise * 0.3 +        │
│           eye_droop * 0.3                 │
│                                             │
│ AngryScore:                                │
│   score = brow_lower * 0.4 +              │
│           eye_squint * 0.3 +              │
│           lip_press * 0.3                 │
│                                             │
│ [... otros calculadores]                   │
│                                             │
│ Output: Dict[str, float]                   │
└────────────────────────────────────────────┘
```

### Frontend Components

#### 1. Component Tree

```
App
└── EmotionRecognition (Main Container)
    ├── VideoFeed
    │   ├── video element
    │   ├── canvas overlay
    │   └── control buttons
    ├── EmotionDisplay
    │   ├── emotion icon
    │   ├── confidence meter
    │   └── emotion label
    ├── SpotifyPlayer
    │   ├── playlist info
    │   ├── playback controls
    │   └── progress bar
    ├── EmotionChart
    │   └── Recharts BarChart
    ├── EmotionHistory
    │   └── List of recent emotions
    └── InfoCard
        └── App information
```

#### 2. State Management

```typescript
┌──────────────────────────────────────────┐
│      EmotionRecognition State            │
├──────────────────────────────────────────┤
│ Local State:                             │
│ • isActive: boolean                      │
│ • currentEmotion: EmotionData | null     │
│ • emotionHistory: EmotionData[]          │
│ • spotifyEnabled: boolean                │
│                                           │
│ Refs:                                    │
│ • videoRef: HTMLVideoElement             │
│ • canvasRef: HTMLCanvasElement           │
│                                           │
│ Effects:                                 │
│ • Camera lifecycle management            │
│ • Emotion detection interval             │
│ • Cleanup on unmount                     │
└──────────────────────────────────────────┘
```

## Pipeline de Procesamiento

### Procesamiento de Características Faciales

```
Face Landmarks (468 points)
         │
         ├─────────────────┬──────────────┬─────────────┐
         │                 │              │             │
         ▼                 ▼              ▼             ▼
    Eyes Points      Eyebrows Pts    Mouth Pts     Nose Pts
         │                 │              │             │
         ▼                 ▼              ▼             ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────┐ ┌─────────┐
│ Eye Metrics     │ │ Brow Metrics │ │ Mouth   │ │ Nose    │
│ • Opening       │ │ • Raise      │ │ Metrics │ │ Metrics │
│ • Asymmetry     │ │ • Angle      │ │ • Open  │ │ • Flare │
│ • Crinkle       │ │ • Distance   │ │ • Smile │ │ • Pos   │
└────────┬────────┘ └──────┬───────┘ └────┬────┘ └────┬────┘
         │                 │              │             │
         └─────────────────┴──────────────┴─────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Combined Features     │
              │  Dictionary            │
              └────────────┬───────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
  ┌──────────┐      ┌──────────┐     ┌──────────┐
  │ Happy    │      │ Sad      │     │ Angry    │
  │ Score    │      │ Score    │     │ Score    │
  └────┬─────┘      └────┬─────┘     └────┬─────┘
       │                 │                 │
       │        ┌────────┼────────┐        │
       │        │        │        │        │
       ▼        ▼        ▼        ▼        ▼
  ┌──────────────────────────────────────────┐
  │      Emotion Scores Dictionary            │
  │  {                                        │
  │    'happy': 0.85,                        │
  │    'sad': 0.12,                          │
  │    'angry': 0.05,                        │
  │    ...                                    │
  │  }                                        │
  └──────────────────────────────────────────┘
```

### Algoritmos de Puntuación

#### Felicidad (Happy)

```
Características:
  smile_intensity    [0.0 - 1.0]
  eye_crinkle       [0.0 - 1.0]
  cheek_raise       [0.0 - 1.0]

Fórmula:
  happy_score = (
    smile_intensity * 0.5 +     // 50% peso
    eye_crinkle * 0.3 +          // 30% peso
    cheek_raise * 0.2            // 20% peso
  )

Rango de salida: [0.0, 1.0]
Umbral de detección: > 0.6
```

#### Tristeza (Sad)

```
Características:
  mouth_frown           [0.0 - 1.0]
  inner_brow_raise      [0.0 - 1.0]
  eye_droop             [0.0 - 1.0]

Fórmula:
  sad_score = (
    mouth_frown * 0.4 +          // 40% peso
    inner_brow_raise * 0.3 +     // 30% peso
    eye_droop * 0.3              // 30% peso
  )

Rango de salida: [0.0, 1.0]
Umbral de detección: > 0.5
```

#### Enojo (Angry)

```
Características:
  brow_lower    [0.0 - 1.0]
  eye_squint    [0.0 - 1.0]
  lip_press     [0.0 - 1.0]

Fórmula:
  angry_score = (
    brow_lower * 0.4 +           // 40% peso
    eye_squint * 0.3 +           // 30% peso
    lip_press * 0.3              // 30% peso
  )

Rango de salida: [0.0, 1.0]
Umbral de detección: > 0.6
```

## Integración Frontend-Backend

### Arquitectura Actual (Standalone)

```
┌───────────────────────┐
│  Frontend (Browser)   │
│                       │
│  ┌─────────────────┐  │
│  │ Video Capture   │  │
│  └────────┬────────┘  │
│           │           │
│  ┌────────▼────────┐  │
│  │ Mock Detection  │  │
│  │ (Simulated)     │  │
│  └────────┬────────┘  │
│           │           │
│  ┌────────▼────────┐  │
│  │ UI Update       │  │
│  └─────────────────┘  │
│                       │
└───────────────────────┘

Backend funciona standalone:
python examples/camera.py
```

### Arquitectura Futura (Integrada)

#### Opción 1: API REST

```
┌────────────────────┐        HTTP POST         ┌──────────────────┐
│  Frontend          │      /api/analyze         │  Backend API     │
│                    │─────────────────────────► │                  │
│  1. Capture frame  │     {image: base64}       │  1. Decode image │
│  2. Send to API    │                           │  2. Process      │
│  3. Display result │◄─────────────────────────│  3. Return JSON  │
│                    │    {emotion, confidence}  │                  │
└────────────────────┘                           └──────────────────┘

Ventajas:
  • Simple de implementar
  • Compatible con HTTP
  • Fácil de escalar

Desventajas:
  • Mayor latencia
  • Overhead de red
```

#### Opción 2: WebSocket

```
┌────────────────────┐                          ┌──────────────────┐
│  Frontend          │        WebSocket          │  Backend         │
│                    │◄────────────────────────► │                  │
│  1. Open WS        │    Bidirectional          │  1. Accept WS    │
│  2. Stream frames  │                           │  2. Process      │
│  3. Receive data   │                           │  3. Stream back  │
│                    │                           │                  │
└────────────────────┘                           └──────────────────┘

Ventajas:
  • Baja latencia
  • Tiempo real
  • Bidireccional

Desventajas:
  • Más complejo
  • Gestión de conexiones
```

#### Opción 3: WebRTC

```
┌────────────────────┐      Peer Connection     ┌──────────────────┐
│  Frontend          │                           │  Backend         │
│                    │◄────────────────────────► │                  │
│  Video stream ────────────────────────────────►  Processing       │
│                    │                           │                  │
│  Data channel  ◄──────────────────────────────  Results          │
│                    │                           │                  │
└────────────────────┘                           └──────────────────┘

Ventajas:
  • Mínima latencia
  • Stream nativo
  • P2P posible

Desventajas:
  • Muy complejo
  • Requiere signaling
```

### API Endpoints (Propuesta)

```
POST /api/v1/analyze
  Request:
    Content-Type: multipart/form-data
    Body: { image: File }
  Response:
    {
      "success": true,
      "data": {
        "emotion": "happy",
        "confidence": 0.85,
        "scores": {
          "happy": 0.85,
          "sad": 0.12,
          ...
        },
        "timestamp": "2025-10-11T10:30:00Z"
      }
    }

WebSocket /ws/emotions
  Client → Server:
    { "type": "frame", "data": "<base64>" }
  Server → Client:
    {
      "type": "emotion",
      "emotion": "happy",
      "confidence": 0.85,
      "timestamp": "2025-10-11T10:30:00Z"
    }
```

## Modelos de Datos

### Backend Data Models

#### FacePoints

```python
{
    'eyes': {
        'right_eye': [
            (x1, y1, z1),
            (x2, y2, z2),
            ...
        ],
        'left_eye': [...]
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

#### ProcessedFeatures

```python
{
    'eyes': {
        'right_eye_opening': float,    # 0.0 - 1.0
        'left_eye_opening': float,
        'eye_asymmetry': float,
        'average_opening': float
    },
    'eyebrows': {
        'right_eyebrow_raise': float,
        'left_eyebrow_raise': float,
        'eyebrow_angle': float,
        'eyebrow_distance': float
    },
    'mouth': {
        'mouth_height': float,
        'mouth_width': float,
        'mouth_aspect_ratio': float,
        'smile_intensity': float,
        'lip_compression': float
    },
    'nose': {
        'nose_position': float,
        'nose_orientation': float,
        'nostril_flare': float
    }
}
```

#### EmotionScores

```python
{
    'happy': float,      # 0.0 - 1.0
    'sad': float,
    'angry': float,
    'surprise': float,
    'disgust': float,
    'fear': float
}
```

### Frontend Data Models

#### EmotionData

```typescript
interface EmotionData {
  emotion: Emotion
  confidence: number    // 0.0 - 1.0
  timestamp: Date
}

type Emotion =
  | "feliz"
  | "triste"
  | "neutral"
  | "enojado"
  | "sorprendido"
  | "amor"
```

#### SpotifyPlaylist

```typescript
interface SpotifyPlaylist {
  name: string
  id: string
  description: string
  color: string         // Tailwind gradient classes
}
```

## Escalabilidad y Rendimiento

### Métricas de Rendimiento

```
┌─────────────────────────────────────────────┐
│           Performance Metrics                │
├─────────────────────────────────────────────┤
│ Backend:                                    │
│ • Face detection: ~20ms                     │
│ • Feature extraction: ~5ms                  │
│ • Emotion classification: ~2ms              │
│ • Total processing: ~30ms (33 FPS)          │
│                                              │
│ Frontend:                                   │
│ • Frame capture: ~5ms                       │
│ • Rendering: ~10ms                          │
│ • UI updates: ~5ms                          │
│                                              │
│ Memory:                                     │
│ • Backend: ~200MB                           │
│ • Frontend: ~150MB                          │
└─────────────────────────────────────────────┘
```

### Estrategias de Escalabilidad

#### Escalado Horizontal (Backend)

```
           Load Balancer
                │
        ┌───────┼───────┐
        │       │       │
        ▼       ▼       ▼
    ┌─────┐ ┌─────┐ ┌─────┐
    │ API │ │ API │ │ API │
    │ 1   │ │ 2   │ │ 3   │
    └──┬──┘ └──┬──┘ └──┬──┘
       │       │       │
       └───────┼───────┘
               │
          ┌────▼────┐
          │ Queue   │
          │ (Redis) │
          └─────────┘
```

#### Optimizaciones

**Backend**:
```python
# 1. Procesamiento asíncrono
async def process_frame_async(frame):
    face_points = await detect_face_async(frame)
    features = await extract_features_async(face_points)
    emotions = await recognize_emotions_async(features)
    return emotions

# 2. Caché de modelos
class CachedEmotionSystem:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.init_models()
        return cls._instance

# 3. Batch processing
def process_batch(frames: List[np.ndarray]):
    results = []
    for frame in frames:
        result = system.process(frame)
        results.append(result)
    return results
```

**Frontend**:
```typescript
// 1. Debouncing de actualizaciones
const debouncedUpdate = useMemo(
  () => debounce((emotion) => {
    setCurrentEmotion(emotion)
  }, 100),
  []
)

// 2. Memoización de cálculos
const chartData = useMemo(() => {
  return processEmotionData(emotionHistory)
}, [emotionHistory])

// 3. Lazy loading de componentes
const EmotionChart = lazy(() => import('./emotion-chart'))
```

## Seguridad

### Consideraciones de Seguridad

#### 1. Privacidad de Video

```
┌─────────────────────────────────────────┐
│         Privacy Protection               │
├─────────────────────────────────────────┤
│ • Video processing local (frontend)     │
│ • No almacenamiento de frames           │
│ • No transmisión de video sin consent   │
│ • Datos anónimos                        │
│ • HTTPS obligatorio                     │
└─────────────────────────────────────────┘
```

#### 2. API Security (Futuro)

```typescript
// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,    // 1 minuto
  max: 100                // 100 requests
})

// CORS configuration
const corsOptions = {
  origin: ['https://emotiplay.app'],
  methods: ['POST'],
  credentials: true
}

// API Key authentication
headers: {
  'X-API-Key': process.env.API_KEY
}
```

#### 3. Data Sanitization

```python
# Backend input validation
from pydantic import BaseModel, validator

class FrameRequest(BaseModel):
    image: str  # base64

    @validator('image')
    def validate_image(cls, v):
        if not is_valid_base64(v):
            raise ValueError('Invalid image format')
        if len(v) > MAX_SIZE:
            raise ValueError('Image too large')
        return v
```

## Arquitectura Futura

### Roadmap de Evolución

#### Fase 1: Integración API (3-6 meses)

```
Frontend ◄──► REST API ◄──► Backend
              (FastAPI)
```

**Objetivos**:
- API REST completa
- Autenticación JWT
- Rate limiting
- Logging y monitoring

#### Fase 2: WebSocket Real-time (6-9 meses)

```
Frontend ◄══► WebSocket ◄══► Backend
               Server
```

**Objetivos**:
- Comunicación bidireccional
- Streaming de video
- Latencia < 100ms

#### Fase 3: Microservicios (9-12 meses)

```
                API Gateway
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    Face Det.    Emotion    Spotify
    Service      Service    Service
```

**Objetivos**:
- Servicios independientes
- Escalado individual
- Tolerancia a fallos
- Service mesh

#### Fase 4: Machine Learning Mejorado (12+ meses)

```
Custom ML Model
      │
      ├─ TensorFlow/PyTorch
      ├─ Transfer learning
      ├─ Fine-tuning
      └─ Edge deployment
```

**Objetivos**:
- Modelo personalizado
- Mayor precisión
- Más emociones
- Análisis contextual

### Tecnologías Futuras

```
Backend Evolution:
  Current: Python + MediaPipe
  Future:  Python + TensorFlow + gRPC

Frontend Evolution:
  Current: React + WebRTC
  Future:  React + WebAssembly + WebGPU

Infrastructure:
  Current: Monolith
  Future:  Kubernetes + Docker + Redis
```

## Conclusión

La arquitectura de EmotiPlay está diseñada para ser:

- **Modular**: Componentes independientes y reutilizables
- **Escalable**: Preparada para crecimiento horizontal
- **Mantenible**: Código limpio y bien documentado
- **Extensible**: Fácil de agregar nuevas características
- **Performante**: Optimizada para tiempo real

El sistema actual proporciona una base sólida para futuras mejoras y puede evolucionar hacia una arquitectura distribuida y basada en microservicios según las necesidades del proyecto.

---

**Última actualización**: 2025-10-11
