"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users, Activity, Calendar, Clock, Download } from "lucide-react"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, AreaChart, Area } from "recharts"

type TimeRange = "day" | "week"

// Datos mock para demostración
const dailyData = [
  { time: "00:00", feliz: 2, triste: 1, neutral: 3, enojado: 0, sorprendido: 1, amor: 1 },
  { time: "04:00", feliz: 1, triste: 2, neutral: 2, enojado: 1, sorprendido: 0, amor: 0 },
  { time: "08:00", feliz: 5, triste: 1, neutral: 4, enojado: 0, sorprendido: 2, amor: 1 },
  { time: "12:00", feliz: 8, triste: 2, neutral: 6, enojado: 1, sorprendido: 3, amor: 2 },
  { time: "16:00", feliz: 6, triste: 3, neutral: 5, enojado: 2, sorprendido: 1, amor: 1 },
  { time: "20:00", feliz: 4, triste: 2, neutral: 3, enojado: 1, sorprendido: 2, amor: 3 },
]

const weeklyData = [
  { day: "Lun", feliz: 45, triste: 12, neutral: 38, enojado: 8, sorprendido: 15, amor: 18 },
  { day: "Mar", feliz: 52, triste: 8, neutral: 42, enojado: 5, sorprendido: 18, amor: 22 },
  { day: "Mié", feliz: 38, triste: 15, neutral: 35, enojado: 12, sorprendido: 10, amor: 15 },
  { day: "Jue", feliz: 48, triste: 10, neutral: 40, enojado: 7, sorprendido: 16, amor: 20 },
  { day: "Vie", feliz: 55, triste: 6, neutral: 45, enojado: 4, sorprendido: 20, amor: 25 },
  { day: "Sáb", feliz: 42, triste: 9, neutral: 38, enojado: 6, sorprendido: 14, amor: 19 },
  { day: "Dom", feliz: 35, triste: 11, neutral: 32, enojado: 8, sorprendido: 12, amor: 16 },
]

const emotionColors = {
  feliz: "#fbbf24", // amber-400
  triste: "#60a5fa", // blue-400
  neutral: "#9ca3af", // gray-400
  enojado: "#f87171", // red-400
  sorprendido: "#a78bfa", // violet-400
  amor: "#f472b6", // pink-400
}

const emotionLabels = {
  feliz: "Feliz",
  triste: "Triste",
  neutral: "Neutral",
  enojado: "Enojado",
  sorprendido: "Sorprendido",
  amor: "Amor",
}

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>("day")
  const [isExporting, setIsExporting] = useState(false)

  const currentData = timeRange === "day" ? dailyData : weeklyData
  const xAxisKey = timeRange === "day" ? "time" : "day"
  const title = timeRange === "day" ? "Tendencias Diarias" : "Tendencias Semanales"

  const exportData = async () => {
    setIsExporting(true)
    
    try {
      const csvContent = [
        `${timeRange === "day" ? "Hora" : "Día"},Feliz,Triste,Neutral,Enojado,Sorprendido,Amor`,
        ...currentData.map(item => [
          timeRange === "day" ? (item as any).time : (item as any).day,
          item.feliz,
          item.triste,
          item.neutral,
          item.enojado,
          item.sorprendido,
          item.amor
        ].join(","))
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `emotion-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`)
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

  // Calcular estadísticas dinámicas
  const totalDetections = currentData.reduce((sum, item) => 
    sum + item.feliz + item.triste + item.neutral + item.enojado + item.sorprendido + item.amor, 0
  )
  
  const emotionTotals = {
    feliz: currentData.reduce((sum, item) => sum + item.feliz, 0),
    triste: currentData.reduce((sum, item) => sum + item.triste, 0),
    neutral: currentData.reduce((sum, item) => sum + item.neutral, 0),
    enojado: currentData.reduce((sum, item) => sum + item.enojado, 0),
    sorprendido: currentData.reduce((sum, item) => sum + item.sorprendido, 0),
    amor: currentData.reduce((sum, item) => sum + item.amor, 0),
  }

  const mostCommonEmotion = Object.entries(emotionTotals).reduce((a, b) => 
    emotionTotals[a[0] as keyof typeof emotionTotals] > emotionTotals[b[0] as keyof typeof emotionTotals] ? a : b
  )[0]

  const averageConfidence = 94.2 // Mock data

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Análisis de Emociones
        </h1>
        <p className="text-lg text-muted-foreground">
          Estadísticas detalladas de tus emociones detectadas
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Detecciones</p>
              <p className="text-2xl font-bold">{totalDetections}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-secondary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Emoción Más Común</p>
              <p className="text-2xl font-bold">{emotionLabels[mostCommonEmotion as keyof typeof emotionLabels]}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{timeRange === "day" ? "Sesiones Hoy" : "Sesiones Esta Semana"}</p>
              <p className="text-2xl font-bold">{timeRange === "day" ? "12" : "84"}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Activity className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Precisión Promedio</p>
              <p className="text-2xl font-bold">{averageConfidence}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico principal */}
      <Card className="p-6 mb-8 hover-lift">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{title}</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={timeRange === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange("day")}
                className="h-8 px-3"
              >
                <Calendar className="h-4 w-4 mr-1" />
                Día
              </Button>
              <Button
                variant={timeRange === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeRange("week")}
                className="h-8 px-3"
              >
                <Clock className="h-4 w-4 mr-1" />
                Semana
              </Button>
            </div>
            
            <Button
              onClick={exportData}
              disabled={isExporting}
              size="sm"
              variant="outline"
              className="transition-all duration-300 hover:scale-105"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exportando..." : "Exportar"}
            </Button>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey={xAxisKey}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area type="monotone" dataKey="feliz" stackId="1" stroke={emotionColors.feliz} fill={emotionColors.feliz} fillOpacity={0.6} />
              <Area type="monotone" dataKey="triste" stackId="1" stroke={emotionColors.triste} fill={emotionColors.triste} fillOpacity={0.6} />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke={emotionColors.neutral} fill={emotionColors.neutral} fillOpacity={0.6} />
              <Area type="monotone" dataKey="enojado" stackId="1" stroke={emotionColors.enojado} fill={emotionColors.enojado} fillOpacity={0.6} />
              <Area type="monotone" dataKey="sorprendido" stackId="1" stroke={emotionColors.sorprendido} fill={emotionColors.sorprendido} fillOpacity={0.6} />
              <Area type="monotone" dataKey="amor" stackId="1" stroke={emotionColors.amor} fill={emotionColors.amor} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leyenda */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(emotionColors).map(([emotion, color]) => (
            <div key={emotion} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm text-muted-foreground">{emotionLabels[emotion as keyof typeof emotionLabels]}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Distribución de emociones */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6 hover-lift">
          <h3 className="text-lg font-semibold mb-4">Distribución de Emociones</h3>
          <div className="space-y-4">
            {Object.entries(emotionTotals).map(([emotion, count]) => {
              const percentage = totalDetections > 0 ? Math.round((count / totalDetections) * 100) : 0
              const color = emotionColors[emotion as keyof typeof emotionColors]
              
              return (
                <div key={emotion} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{emotionLabels[emotion as keyof typeof emotionLabels]}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{count} detecciones</span>
                      <Badge variant="outline">{percentage}%</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: color
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <h3 className="text-lg font-semibold mb-4">Resumen Temporal</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Período actual</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {timeRange === "day" ? "Últimas 24 horas" : "Última semana"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Tendencia</span>
              </div>
              <span className="text-sm text-green-600 font-medium">↗ +12%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">Pico de actividad</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {timeRange === "day" ? "12:00 - 16:00" : "Viernes"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
