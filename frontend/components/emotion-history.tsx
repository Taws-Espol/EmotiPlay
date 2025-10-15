"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Smile, Frown, Meh, Angry, Zap as Surprise, Heart, Clock } from "lucide-react"

type Emotion = "feliz" | "triste" | "neutral" | "enojado" | "sorprendido" | "amor"

interface EmotionData {
  emotion: Emotion
  confidence: number
  timestamp: Date
}

const emotionIcons = {
  feliz: Smile,
  triste: Frown,
  neutral: Meh,
  enojado: Angry,
  sorprendido: Surprise,
  amor: Heart,
}

const emotionColors = {
  feliz: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  triste: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  neutral: "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30",
  enojado: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
  sorprendido: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
  amor: "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30",
}

const emotionLabels = {
  feliz: "Feliz",
  triste: "Triste",
  neutral: "Neutral",
  enojado: "Enojado",
  sorprendido: "Sorprendido",
  amor: "Amor",
}

export default function EmotionHistory({ data }: { data: EmotionData[] }) {
  const reversedData = [...data].reverse()

  return (
    <Card className="p-6 shadow-xl border-2 hover-lift transition-all duration-300">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary animate-pulse" />
        Historial Reciente
      </h2>
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {reversedData.map((item, index) => {
            const Icon = emotionIcons[item.emotion] || Meh
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-[1.02] hover:shadow-md border border-transparent hover:border-primary/20 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div
                  className={`p-2 rounded-full ${emotionColors[item.emotion]} border transition-all duration-300 hover:scale-110`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{emotionLabels[item.emotion]}</p>
                  <p className="text-xs text-muted-foreground">{item.timestamp.toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">{(item.confidence * 100).toFixed(0)}%</div>
                  <div className="w-12 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
                      style={{ width: `${item.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </Card>
  )
}
