"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Smile, Frown, Meh, Angry, Sunrise as Surprise, Heart, Clock, Download, Calendar } from "lucide-react"
import { useState } from "react"

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
  feliz: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-400",
    line: "bg-amber-400"
  },
  triste: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-400",
    line: "bg-blue-400"
  },
  neutral: {
    bg: "bg-gray-50 dark:bg-gray-950/20",
    text: "text-gray-700 dark:text-gray-300",
    border: "border-gray-200 dark:border-gray-800",
    dot: "bg-gray-400",
    line: "bg-gray-400"
  },
  enojado: {
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-400",
    line: "bg-red-400"
  },
  sorprendido: {
    bg: "bg-violet-50 dark:bg-violet-950/20",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
    dot: "bg-violet-400",
    line: "bg-violet-400"
  },
  amor: {
    bg: "bg-pink-50 dark:bg-pink-950/20",
    text: "text-pink-700 dark:text-pink-300",
    border: "border-pink-200 dark:border-pink-800",
    dot: "bg-pink-400",
    line: "bg-pink-400"
  },
}

const emotionLabels = {
  feliz: "Feliz",
  triste: "Triste",
  neutral: "Neutral",
  enojado: "Enojado",
  sorprendido: "Sorprendido",
  amor: "Amor",
}

const emotionEmojis = {
  feliz: "😊",
  triste: "😢",
  neutral: "😐",
  enojado: "😠",
  sorprendido: "😲",
  amor: "😍",
}

export default function EmotionHistory({ data }: { data: EmotionData[] }) {
  const [isExporting, setIsExporting] = useState(false)
  const reversedData = [...data].reverse()

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Ahora"
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    return `Hace ${days}d`
  }

  const exportData = async () => {
    setIsExporting(true)
    
    try {
      const csvContent = [
        "Emoción,Confianza,Fecha,Hora",
        ...data.map(item => [
          emotionLabels[item.emotion],
          `${(item.confidence * 100).toFixed(1)}%`,
          item.timestamp.toLocaleDateString(),
          item.timestamp.toLocaleTimeString()
        ].join(","))
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `emotion-history-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error al exportar datos:", error)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card className="p-6 shadow-xl border-2 hover-lift transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary animate-pulse" />
          Historial Reciente
        </h2>
        <Button
          onClick={exportData}
          disabled={isExporting || data.length === 0}
          size="sm"
          variant="outline"
          className="transition-all duration-300 hover:scale-105"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? "Exportando..." : "Exportar"}
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay historial disponible</p>
          <p className="text-sm">Activa la cámara para comenzar a registrar emociones</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-secondary/20 to-accent/20"></div>
            
            <div className="space-y-4">
              {reversedData.map((item, index) => {
                const Icon = emotionIcons[item.emotion]
                const colors = emotionColors[item.emotion]
                const isLast = index === reversedData.length - 1
                
                return (
                  <div
                    key={index}
                    className="relative flex items-start gap-4 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg`}>
                        <span className="text-lg">{emotionEmojis[item.emotion]}</span>
                      </div>
                      {/* Connection line */}
                      {!isLast && (
                        <div className={`absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-4 ${colors.line} opacity-30`}></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 p-4 rounded-lg border ${colors.bg} ${colors.border} transition-all duration-300 hover:scale-[1.02] hover:shadow-md`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-5 h-5 ${colors.text}`} />
                          <span className={`font-semibold ${colors.text}`}>
                            {emotionLabels[item.emotion]}
                          </span>
                        </div>
                        <Badge variant="outline" className={`${colors.text} border-current`}>
                          {(item.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{item.timestamp.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{item.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {formatTime(item.timestamp)}
                        </div>
                      </div>

                      {/* Confidence bar */}
                      <div className="mt-3 w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${colors.line} transition-all duration-1000 ease-out`}
                          style={{ width: `${item.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollArea>
      )}
    </Card>
  )
}
