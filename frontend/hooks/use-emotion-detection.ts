// frontend/hooks/use-emotion-detection.ts

import { useState, useCallback, useRef, useEffect } from 'react'

type Emotion = 'feliz' | 'triste' | 'neutral' | 'enojado' | 'sorprendido' | 'amor'

interface EmotionData {
  emotion: Emotion
  confidence: number
  timestamp: Date
  scores?: Record<string, number>
}

interface UseEmotionDetectionOptions {
  interval?: number
  autoStart?: boolean
  onDetection?: (data: EmotionData) => void
  onError?: (error: string) => void
}

interface UseEmotionDetectionReturn {
  currentEmotion: EmotionData | null
  isDetecting: boolean
  isConnected: boolean
  error: string | null
  startDetection: (captureFrame: () => string | null) => void
  stopDetection: () => void
}

const DEFAULT_WS_PATH = '/api/ws/emotions/detect'

// Reemplaza buildWebSocketUrl por esta versión que respeta NEXT_PUBLIC_WS_URL
function buildWebSocketUrl() {
  // prefer env var when provided (NEXT_PUBLIC_* expuesto al cliente)
  const envUrl = (process.env.NEXT_PUBLIC_WS_URL as string | undefined) ?? undefined
  if (envUrl) return envUrl

  if (typeof window === 'undefined') {
    return `ws://localhost:8000${DEFAULT_WS_PATH}`
  }

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = window.location.hostname
  const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80')

  // Dev: si estás corriendo Next en localhost:3000 y backend en 8000, redirigir al backend
  if (host === 'localhost' && port === '3000') {
    return `${proto}//${host}:8000${DEFAULT_WS_PATH}`
  }

  return `${proto}//${window.location.host}${DEFAULT_WS_PATH}`
}

// Mapeo de emociones inglés -> español
const emotionMap: Record<string, Emotion> = {
  happy: 'feliz',
  sad: 'triste',
  angry: 'enojado',
  surprise: 'sorprendido',
  neutral: 'neutral',
}

export function useEmotionDetection(
  options: UseEmotionDetectionOptions = {},
): UseEmotionDetectionReturn {
  const { interval = 2000, onDetection, onError } = options

  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const captureFrameRef = useRef<(() => string | null) | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connectingRef = useRef(false)
  const manualStopRef = useRef(false)

  const connectWebSocket = useCallback(() => {
    try {
      // Prevent duplicate connections
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        return
      }
      connectingRef.current = true
      manualStopRef.current = false

      const url = buildWebSocketUrl()
      const ws = new WebSocket(url)

      ws.onopen = () => {
        console.log('✅ WebSocket conectado', url)
        connectingRef.current = false
        setIsConnected(true)
        setError(null)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (typeof data === 'string' && data.includes('Invalid data')) {
            setError(data)
            if (onError) onError(data)
            return
          }

          if (data.emotion) {
            const emotionSpanish = emotionMap[data.emotion] || (data.emotion as Emotion)

            const emotionData: EmotionData = {
              emotion: emotionSpanish,
              confidence: data.confidence ?? 0.85,
              timestamp: new Date(),
              scores: data.scores,
            }

            setCurrentEmotion(emotionData)
            setError(null)

            if (onDetection) {
              onDetection(emotionData)
            }
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err)
          const errorMsg = 'Error al procesar respuesta del servidor'
          setError(errorMsg)
          if (onError) onError(errorMsg)
        }
      }

      ws.onerror = (event) => {
        // event suele ser un Event con poca info; loggea el objeto completo
        console.error('❌ WebSocket error:', (event as any)?.message ?? (event as any)?.type ?? event, event)
        const errorMsg = `Error de conexión con el servidor`
        setError(errorMsg)
        if (onError) onError(errorMsg)
        // no forzar cierre aquí; onclose manejará reconexión/backoff
      }

      ws.onclose = (ev) => {
        console.log('🔌 WebSocket disconnected', { code: ev.code, reason: ev.reason, wasClean: ev.wasClean })
        connectingRef.current = false
        setIsConnected(false)

        // Reconnect only if detection is active and stop wasn't requested manually
        if (isDetecting && !manualStopRef.current) {
          // small backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Intentando reconectar WebSocket...')
            connectWebSocket()
          }, 3000)
        }
      }

      wsRef.current = ws
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al conectar WebSocket'
      setError(errorMsg)
      connectingRef.current = false
      if (onError) onError(errorMsg)
    }
  }, [isDetecting, onDetection, onError])

  const sendFrame = useCallback(() => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return
    }

    const capt = captureFrameRef.current
    if (!capt) return

    const frameData = capt()
    if (!frameData) return

    try {
      const base64Data = typeof frameData === 'string' && frameData.includes(',') ? frameData.split(',')[1] : frameData
      const message = JSON.stringify({ frame: base64Data })
      ws.send(message)
    } catch (err) {
      console.error('Error enviando frame:', err)
    }
  }, [])

  const startDetection = useCallback(
    (captureFrame: () => string | null) => {
      if (isDetecting) return

      captureFrameRef.current = captureFrame
      setIsDetecting(true)
      setError(null)
      manualStopRef.current = false

      // Conectar WebSocket si no está conectado o en proceso de conexión
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connectWebSocket()
      }

      // Esperar a que la conexión esté lista antes de empezar a enviar frames
      const waitForConnection = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          clearInterval(waitForConnection)

          // Enviar primer frame inmediatamente
          sendFrame()

          // Configurar intervalo para enviar frames
          intervalRef.current = setInterval(sendFrame, interval)
        }
      }, 100)

      // Limpiar el intervalo de espera después de 5 segundos si no se conecta
      setTimeout(() => clearInterval(waitForConnection), 5000)
    },
    [isDetecting, connectWebSocket, sendFrame, interval],
  )

  const stopDetection = useCallback(() => {
    manualStopRef.current = true

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      try { wsRef.current.close() } catch (e) {}
      wsRef.current = null
    }

    setIsDetecting(false)
    setIsConnected(false)
    setCurrentEmotion(null) 
    captureFrameRef.current = null
  }, [])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return {
    currentEmotion,
    isDetecting,
    isConnected,
    error,
    startDetection,
    stopDetection,
  }
}