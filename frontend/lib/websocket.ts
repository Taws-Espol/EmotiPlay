type Emotion = "feliz" | "triste" | "neutral" | "enojado" | "sorprendido" | "disgusto" | "miedo"

interface EmotionData {
  emotion: Emotion
  confidence: number
  timestamp: Date
}

interface PersonDetection {
  id: number
  bbox: [number, number, number, number]
  emotion: string | null
  confidence: number
  has_face: boolean
}

interface WebSocketMessage {
  frame: string  // base64 JPEG
  emotions: PersonDetection[]
  timestamp: number
  active_tracks: number
  total_clients: number
}

// Mapeo Backend (inglés capitalizado) → Frontend (español)
const emotionMapping: Record<string, Emotion> = {
  'Happy': 'feliz',
  'Sad': 'triste',
  'Angry': 'enojado',
  'Surprise': 'sorprendido',
  'Disgust': 'disgusto',
  'Fear': 'miedo',
  'Neutral': 'neutral',
}

export class EmotionWebSocket {
  private ws: WebSocket | null = null
  private onEmotionCallback?: (data: EmotionData) => void
  private onFrameCallback?: (frameBase64: string) => void
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout?: NodeJS.Timeout

  constructor(
    private url: string = 'ws://localhost:8000/api/ws/emotions/detect'
  ) {}

  connect(
    onEmotion: (data: EmotionData) => void,
    onFrame?: (frameBase64: string) => void
  ) {
    this.onEmotionCallback = onEmotion
    this.onFrameCallback = onFrame

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log('✅ WebSocket conectado al backend')
        this.reconnectAttempts = 0
      }

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          // Enviar frame procesado (YA viene con bounding boxes dibujados)
          if (this.onFrameCallback && message.frame) {
            this.onFrameCallback(message.frame)
          }

          // Procesar emociones detectadas
          if (message.emotions && message.emotions.length > 0) {
            // Tomar la primera persona detectada
            const person = message.emotions[0]

            if (person.emotion && person.confidence > 0) {
              const frontendEmotion = emotionMapping[person.emotion] || 'neutral'

              const emotionData: EmotionData = {
                emotion: frontendEmotion,
                confidence: person.confidence,
                timestamp: new Date(),
              }

              this.onEmotionCallback?.(emotionData)
            }
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
      }

      this.ws.onclose = () => {
        console.log('🔌 WebSocket desconectado')
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('❌ Error al conectar WebSocket:', error)
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Máximo de reintentos de conexión alcanzado')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000)

    console.log(`🔄 Reintentando conexión en ${delay}ms... (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

    this.reconnectTimeout = setTimeout(() => {
      if (this.onEmotionCallback) {
        this.connect(this.onEmotionCallback, this.onFrameCallback)
      }
    }, delay)
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    console.log('✅ WebSocket desconectado correctamente')
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
