// frontend/hooks/use-emotion-detection.ts

import { useState, useCallback, useRef, useEffect } from 'react'

type Emotion = 'feliz' | 'triste' | 'neutral' | 'enojado' | 'sorprendido' | 'amor'

interface EmotionData {
  emotion: Emotion
  confidence: number
  timestamp: Date
  scores: Record<string, number>
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
  error: string | null
  startDetection: (captureFrame: () => string | null) => void
  stopDetection: () => void
  detectOnce: (frame: string) => Promise<void>
}

export function useEmotionDetection(
  options: UseEmotionDetectionOptions = {},
): UseEmotionDetectionReturn {
  const { interval = 2000, onDetection, onError } = options

  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isDetectingRef = useRef(false)

  const detectEmotion = useCallback(
    async (frameData: string) => {
      if (isDetectingRef.current) return

      isDetectingRef.current = true

      try {
        const response = await fetch('http://localhost:8000/api/v1/detect/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: frameData,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.detection.face_detected) {
          const emotionData: EmotionData = {
            emotion: data.detection.clase as Emotion,
            confidence: data.detection.confianza,
            timestamp: new Date(),
            scores: data.detection.scores,
          }

          setCurrentEmotion(emotionData)
          setError(null)

          if (onDetection) {
            onDetection(emotionData)
          }
        } else {
          const errorMsg = data.error?.message || 'No se detectó ningún rostro'
          setError(errorMsg)
          if (onError) {
            onError(errorMsg)
          }
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Error al detectar emoción'
        setError(errorMsg)
        if (onError) {
          onError(errorMsg)
        }
      } finally {
        isDetectingRef.current = false
      }
    },
    [onDetection, onError],
  )

  const detectOnce = useCallback(
    async (frame: string) => {
      await detectEmotion(frame)
    },
    [detectEmotion],
  )

  const startDetection = useCallback(
    (captureFrame: () => string | null) => {
      if (isDetecting) return

      setIsDetecting(true)
      setError(null)

      const detect = async () => {
        const frame = captureFrame()
        if (frame) {
          await detectEmotion(frame)
        }
      }

      detect()

      intervalRef.current = setInterval(detect, interval)
    },
    [isDetecting, detectEmotion, interval],
  )

  const stopDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsDetecting(false)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  return {
    currentEmotion,
    isDetecting,
    error,
    startDetection,
    stopDetection,
    detectOnce,
  }
}