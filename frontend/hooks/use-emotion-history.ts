// frontend/hooks/use-emotion-history.ts

import { useState, useCallback, useMemo } from 'react'

type Emotion = 'feliz' | 'triste' | 'neutral' | 'enojado' | 'sorprendido' | 'amor'

interface EmotionData {
  emotion: Emotion
  confidence: number
  timestamp: Date
  scores?: Record<string, number>
}

interface EmotionStats {
  total: number
  distribution: Record<Emotion, number>
  percentages: Record<Emotion, number>
  dominant: Emotion | null
  averageConfidence: number
}

interface UseEmotionHistoryReturn {
  history: EmotionData[]
  addEmotion: (emotion: EmotionData) => void
  clearHistory: () => void
  getStats: () => EmotionStats
  getRecentHistory: (count: number) => EmotionData[]
  filterByEmotion: (emotion: Emotion) => EmotionData[]
  filterByTimeRange: (startTime: Date, endTime: Date) => EmotionData[]
}

export function useEmotionHistory(
  maxSize: number = 500,
): UseEmotionHistoryReturn {
  const [history, setHistory] = useState<EmotionData[]>([])

  const addEmotion = useCallback(
    (emotion: EmotionData) => {
      setHistory((prev) => {
        const newHistory = [...prev, emotion]
        return newHistory.slice(-maxSize)
      })
    },
    [maxSize],
  )

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const getStats = useCallback((): EmotionStats => {
    if (history.length === 0) {
      return {
        total: 0,
        distribution: {} as Record<Emotion, number>,
        percentages: {} as Record<Emotion, number>,
        dominant: null,
        averageConfidence: 0,
      }
    }

    const distribution: Record<string, number> = {}
    let totalConfidence = 0

    history.forEach((item) => {
      distribution[item.emotion] = (distribution[item.emotion] || 0) + 1
      totalConfidence += item.confidence
    })

    const percentages: Record<string, number> = {}
    Object.keys(distribution).forEach((emotion) => {
      percentages[emotion] = (distribution[emotion] / history.length) * 100
    })

    const dominant = Object.entries(distribution).reduce((a, b) =>
      a[1] > b[1] ? a : b,
    )[0] as Emotion

    return {
      total: history.length,
      distribution: distribution as Record<Emotion, number>,
      percentages: percentages as Record<Emotion, number>,
      dominant,
      averageConfidence: totalConfidence / history.length,
    }
  }, [history])

  const getRecentHistory = useCallback(
    (count: number): EmotionData[] => {
      return history.slice(-count)
    },
    [history],
  )

  const filterByEmotion = useCallback(
    (emotion: Emotion): EmotionData[] => {
      return history.filter((item) => item.emotion === emotion)
    },
    [history],
  )

  const filterByTimeRange = useCallback(
    (startTime: Date, endTime: Date): EmotionData[] => {
      return history.filter(
        (item) =>
          item.timestamp >= startTime && item.timestamp <= endTime,
      )
    },
    [history],
  )

  return {
    history,
    addEmotion,
    clearHistory,
    getStats,
    getRecentHistory,
    filterByEmotion,
    filterByTimeRange,
  }
}