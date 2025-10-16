"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell } from "recharts"
import { useState } from "react"
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type Emotion = "feliz" | "triste" | "neutral" | "enojado" | "sorprendido" | "amor"

interface EmotionData {
  emotion: Emotion
  confidence: number
  timestamp: Date
}

// Paleta de colores suave y consistente
const emotionColors: Record<Emotion, { 
  primary: string, 
  light: string, 
  hover: string,
  gradient: string,
  bg: string,
  text: string 
}> = {
  feliz: {
    primary: "#fbbf24", // amber-400 - más suave
    light: "#fcd34d", // amber-300
    hover: "#f59e0b", // amber-500 - más intenso para hover
    gradient: "from-amber-300 to-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300"
  },
  triste: {
    primary: "#60a5fa", // blue-400 - más suave
    light: "#93c5fd", // blue-300
    hover: "#3b82f6", // blue-500 - más intenso para hover
    gradient: "from-blue-300 to-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    text: "text-blue-700 dark:text-blue-300"
  },
  neutral: {
    primary: "#9ca3af", // gray-400 - más suave
    light: "#d1d5db", // gray-300
    hover: "#6b7280", // gray-500 - más intenso para hover
    gradient: "from-gray-300 to-gray-500",
    bg: "bg-gray-50 dark:bg-gray-950/20",
    text: "text-gray-700 dark:text-gray-300"
  },
  enojado: {
    primary: "#f87171", // red-400 - más suave
    light: "#fca5a5", // red-300
    hover: "#ef4444", // red-500 - más intenso para hover
    gradient: "from-red-300 to-red-500",
    bg: "bg-red-50 dark:bg-red-950/20",
    text: "text-red-700 dark:text-red-300"
  },
  sorprendido: {
    primary: "#a78bfa", // violet-400 - más suave
    light: "#c4b5fd", // violet-300
    hover: "#8b5cf6", // violet-500 - más intenso para hover
    gradient: "from-violet-300 to-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/20",
    text: "text-violet-700 dark:text-violet-300"
  },
  amor: {
    primary: "#f472b6", // pink-400 - más suave
    light: "#f9a8d4", // pink-300
    hover: "#ec4899", // pink-500 - más intenso para hover
    gradient: "from-pink-300 to-pink-500",
    bg: "bg-pink-50 dark:bg-pink-950/20",
    text: "text-pink-700 dark:text-pink-300"
  },
}

const emotionLabels: Record<Emotion, string> = {
  feliz: "Feliz",
  triste: "Triste",
  neutral: "Neutral",
  enojado: "Enojado",
  sorprendido: "Sorprendido",
  amor: "Amor",
}

const emotionIcons: Record<Emotion, string> = {
  feliz: "😊",
  triste: "😢",
  neutral: "😐",
  enojado: "😠",
  sorprendido: "😲",
  amor: "😍",
}

type ChartType = "bar" | "pie"

export default function EmotionChart({ data }: { data: EmotionData[] }) {
  const [chartType, setChartType] = useState<ChartType>("bar")

  const emotionCounts = data.reduce(
    (acc, item) => {
      acc[item.emotion] = (acc[item.emotion] || 0) + 1
      return acc
    },
    {} as Record<Emotion, number>,
  )

  const totalEmotions = data.length
  const chartData = Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion: emotionLabels[emotion as Emotion],
    emotionKey: emotion as Emotion,
    count,
    percentage: totalEmotions > 0 ? Math.round((count / totalEmotions) * 100) : 0,
    color: emotionColors[emotion as Emotion].primary,
    hoverColor: emotionColors[emotion as Emotion].hover,
    ...emotionColors[emotion as Emotion]
  }))

  const pieData = chartData.map(item => ({
    ...item,
    value: item.count
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const emotionKey = data.emotionKey as Emotion
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{emotionIcons[emotionKey]}</span>
            <span className="font-semibold">{data.emotion}</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Cantidad:</span>
              <span className="font-medium">{data.count}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Porcentaje:</span>
              <span className="font-medium">{data.percentage}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="p-6 shadow-xl border-2 hover-lift transition-all duration-300 animate-scale-in">
      <style jsx>{`
        .emotion-bar:hover {
          /* Sin cambios visuales en la barra, solo tooltip */
        }
        .emotion-pie:hover {
          /* Sin cambios visuales en el pie, solo tooltip */
        }
      `}</style>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Distribución de Emociones</h2>
        </div>
        
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={chartType === "bar" ? "default" : "ghost"}
            size="sm"
            onClick={() => setChartType("bar")}
            className="h-8 px-3"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Barras
          </Button>
          <Button
            variant={chartType === "pie" ? "default" : "ghost"}
            size="sm"
            onClick={() => setChartType("pie")}
            className="h-8 px-3"
          >
            <PieChartIcon className="h-4 w-4 mr-1" />
            Circular
          </Button>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>No hay datos suficientes para mostrar el gráfico</p>
          <p className="text-sm">Activa la cámara para comenzar a detectar emociones</p>
        </div>
      ) : (
        <>
          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">{totalEmotions}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-secondary">{chartData.length}</div>
              <div className="text-sm text-muted-foreground">Emociones</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 md:col-span-1 col-span-2">
              <div className="text-2xl font-bold text-accent">
                {chartData.length > 0 ? Math.max(...chartData.map(d => d.percentage)) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Mayor %</div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis 
                    dataKey="emotion" 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} animationDuration={1200}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="emotion-bar"
                        style={{ 
                          cursor: 'pointer'
                        }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    animationDuration={1200}
                  >
                    {pieData.map((entry, index) => (
                      <PieCell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        className="emotion-pie"
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Leyenda mejorada */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            {chartData.map((item, index) => (
              <div
                key={item.emotionKey}
                className={`p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${item.bg}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{emotionIcons[item.emotionKey]}</span>
                  <span className={`font-medium ${item.text}`}>{item.emotion}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.count} veces</span>
                  <Badge variant="outline" className={`${item.text} border-current`}>
                    {item.percentage}%
                  </Badge>
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-1000 ease-out`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}
