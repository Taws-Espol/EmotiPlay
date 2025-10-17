"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { History, Clock, TrendingUp, Download, Calendar, Smile, Frown, Meh, Angry, Sunrise as Surprise, Heart, Filter, X } from "lucide-react"
import { useState } from "react"

const mockHistory = [
  { id: 1, emotion: "feliz", confidence: 0.92, timestamp: new Date(), duration: "2m 15s" },
  { id: 2, emotion: "neutral", confidence: 0.87, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), duration: "1m 45s" },
  { id: 3, emotion: "triste", confidence: 0.89, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), duration: "3m 20s" },
  { id: 4, emotion: "feliz", confidence: 0.94, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), duration: "2m 50s" },
  { id: 5, emotion: "sorprendido", confidence: 0.91, timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), duration: "1m 30s" },
  { id: 6, emotion: "enojado", confidence: 0.88, timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000), duration: "2m 10s" },
  { id: 7, emotion: "amor", confidence: 0.93, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), duration: "4m 05s" },
  { id: 8, emotion: "feliz", confidence: 0.90, timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000), duration: "3m 15s" },
  { id: 9, emotion: "neutral", confidence: 0.85, timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000), duration: "2m 30s" },
  { id: 10, emotion: "triste", confidence: 0.91, timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), duration: "1m 55s" },
  { id: 11, emotion: "feliz", confidence: 0.88, timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000), duration: "3m 10s" },
  { id: 12, emotion: "sorprendido", confidence: 0.89, timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000), duration: "2m 45s" },
]

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

export default function HistoryPage() {
  const [isExporting, setIsExporting] = useState(false)
  const [selectedEmotion, setSelectedEmotion] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [customDate, setCustomDate] = useState<string>("")
  
  const reversedHistory = [...mockHistory].reverse()

  // Función para filtrar los registros
  const getFilteredHistory = () => {
    let filtered = [...mockHistory]

    // Filtro por emoción
    if (selectedEmotion !== "all") {
      filtered = filtered.filter(record => record.emotion === selectedEmotion)
    }

    // Filtro por fecha
    if (dateFilter !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(record => 
            record.timestamp >= today
          )
          break
        case "yesterday":
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)
          filtered = filtered.filter(record => 
            record.timestamp >= yesterday && record.timestamp < today
          )
          break
        case "week":
          const weekAgo = new Date(today)
          weekAgo.setDate(weekAgo.getDate() - 7)
          filtered = filtered.filter(record => 
            record.timestamp >= weekAgo
          )
          break
        case "month":
          const monthAgo = new Date(today)
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          filtered = filtered.filter(record => 
            record.timestamp >= monthAgo
          )
          break
        case "custom":
          if (customDate) {
            const selectedDate = new Date(customDate)
            const nextDay = new Date(selectedDate)
            nextDay.setDate(nextDay.getDate() + 1)
            filtered = filtered.filter(record => 
              record.timestamp >= selectedDate && record.timestamp < nextDay
            )
          }
          break
      }
    }

    return filtered.reverse()
  }

  const filteredHistory = getFilteredHistory()

  const clearFilters = () => {
    setSelectedEmotion("all")
    setDateFilter("all")
    setCustomDate("")
  }

  const hasActiveFilters = selectedEmotion !== "all" || dateFilter !== "all"

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
        "ID,Emoción,Confianza,Fecha,Hora,Duración",
        ...filteredHistory.map(record => [
          record.id,
          emotionLabels[record.emotion as keyof typeof emotionLabels],
          `${(record.confidence * 100).toFixed(1)}%`,
          record.timestamp.toLocaleDateString(),
          record.timestamp.toLocaleTimeString(),
          record.duration
        ].join(","))
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `emotion-history-filtered-${new Date().toISOString().split('T')[0]}.csv`)
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

  // Calcular estadísticas basadas en datos filtrados
  const totalDuration = filteredHistory.reduce((sum, record) => {
    const duration = record.duration.split(' ')[0] // Extraer minutos
    return sum + parseInt(duration)
  }, 0)

  const averageConfidence = filteredHistory.length > 0 
    ? filteredHistory.reduce((sum, record) => sum + record.confidence, 0) / filteredHistory.length 
    : 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Historial de Emociones
        </h1>
        <p className="text-lg text-muted-foreground">
          Registro completo de todas las emociones detectadas
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
              <p className="text-2xl font-bold">{filteredHistory.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <Clock className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tiempo Total</p>
              <p className="text-2xl font-bold">{totalDuration}m</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Precisión Promedio</p>
              <p className="text-2xl font-bold">{(averageConfidence * 100).toFixed(1)}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Última Sesión</p>
              <p className="text-sm font-bold">Hoy {mockHistory[0].timestamp.toLocaleTimeString().slice(0, 5)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline de Registros con Filtros Integrados */}
      <Card className="p-6 hover-lift">
        {/* Header con título, filtros y botón de exportar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary animate-pulse" />
              Registros Recientes
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Filtrado
                </Badge>
              )}
            </h3>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar
                </Button>
              )}
              <Button
                onClick={exportData}
                disabled={isExporting || filteredHistory.length === 0}
                size="sm"
                variant="outline"
                className="transition-all duration-300 hover:scale-105"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exportando..." : "Exportar"}
              </Button>
            </div>
          </div>

          {/* Filtros integrados en el header */}
          <div className="flex flex-wrap items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border/20">
            {/* Filtro por emoción */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Emoción:</label>
              <Select value={selectedEmotion} onValueChange={setSelectedEmotion}>
                <SelectTrigger className="w-[180px] h-9 text-sm">
                  <SelectValue placeholder="Seleccionar emoción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las emociones</SelectItem>
                  {Object.entries(emotionLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{emotionEmojis[key as keyof typeof emotionEmojis]}</span>
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por fecha */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Período:</label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[160px] h-9 text-sm">
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los períodos</SelectItem>
                  <SelectItem value="today">Hoy</SelectItem>
                  <SelectItem value="yesterday">Ayer</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="custom">Fecha específica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Fecha personalizada */}
            {dateFilter === "custom" && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Fecha:</label>
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-[160px] h-9 text-sm"
                />
              </div>
            )}

            {/* Resumen de resultados */}
            <div className="flex items-center gap-2 ml-auto">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredHistory.length}</span>
                <span> de {mockHistory.length} registros</span>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[600px] pr-4">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-secondary/20 to-accent/20"></div>
            
            <div className="space-y-4">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Clock className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No hay registros</h3>
                  <p className="text-muted-foreground">
                    {hasActiveFilters 
                      ? "No se encontraron registros con los filtros aplicados" 
                      : "No hay registros de emociones disponibles"
                    }
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      size="sm"
                      className="mt-4"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              ) : (
                filteredHistory.map((record, index) => {
                const Icon = emotionIcons[record.emotion as keyof typeof emotionIcons]
                const colors = emotionColors[record.emotion as keyof typeof emotionColors]
                const isLast = index === filteredHistory.length - 1
                
                return (
                  <div
                    key={record.id}
                    className="relative flex items-start gap-4 animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full ${colors.bg} ${colors.border} border-2 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg`}>
                        <span className="text-lg">{emotionEmojis[record.emotion as keyof typeof emotionEmojis]}</span>
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
                            {emotionLabels[record.emotion as keyof typeof emotionLabels]}
                          </span>
                        </div>
                        <Badge variant="outline" className={`${colors.text} border-current`}>
                          {(record.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-3">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{record.timestamp.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{record.timestamp.toLocaleTimeString()}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {formatTime(record.timestamp)}
                        </div>
                      </div>

                      {/* Duración */}
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-muted-foreground">Duración:</span>
                        <span className="font-medium">{record.duration}</span>
                      </div>

                      {/* Confidence bar */}
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${colors.line} transition-all duration-1000 ease-out`}
                          style={{ width: `${record.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
                })
              )}
            </div>
          </div>
        </ScrollArea>
      </Card>
    </div>
  )
}
