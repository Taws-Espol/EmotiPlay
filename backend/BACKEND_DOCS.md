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
