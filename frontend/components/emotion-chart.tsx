// frontend/components/emotion-chart.tsx

"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useMemo } from "react"

type Emotion = "feliz" | "triste" | "neutral" | "enojado" | "sorprendido" | "amor"

interface EmotionData {
  emotion: Emotion
  confidence: number
  timestamp: Date
}

const emotionColors: Record<Emotion, string> = {
  feliz: "#eab308",
  triste: "#3b82f6",
  neutral: "#6b7280",
  enojado: "#ef4444",
  sorprendido: "#a855f7",
  amor: "#ec4899",
}

const emotionLabels: Record<Emotion, string> = {
  feliz: "Feliz",
  triste: "Triste",
  neutral: "Neutral",
  enojado: "Enojado",
  sorprendido: "Sorprendido",
  amor: "Amor",
}

export default function EmotionChart({ data }: { data: EmotionData[] }) {
  const chartData = useMemo(() => {
    const emotionCounts = data.reduce(
      (acc, item) => {
        acc[item.emotion] = (acc[item.emotion] || 0) + 1
        return acc
      },
      {} as Record<Emotion, number>,
    )

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion: emotionLabels[emotion as Emotion],
      count,
      color: emotionColors[emotion as Emotion],
    }))
  }, [data])

  if (chartData.length === 0) {
    return null
  }

  return (
    <Card className="p-6 shadow-xl border-2 hover-lift transition-all duration-300 animate-scale-in">
      <h2 className="text-xl font-semibold mb-4">Distribución de Emociones</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="emotion" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            cursor={{ fill: "rgba(168, 85, 247, 0.1)" }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={800}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}