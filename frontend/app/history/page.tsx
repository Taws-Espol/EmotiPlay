import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { History, Clock, TrendingUp } from "lucide-react"

const mockHistory = [
  { id: 1, emotion: "feliz", confidence: 0.92, timestamp: "2024-01-15 14:30:25", duration: "2m 15s" },
  { id: 2, emotion: "neutral", confidence: 0.87, timestamp: "2024-01-15 14:28:10", duration: "1m 45s" },
  { id: 3, emotion: "triste", confidence: 0.89, timestamp: "2024-01-15 14:26:25", duration: "3m 20s" },
  { id: 4, emotion: "feliz", confidence: 0.94, timestamp: "2024-01-15 14:23:05", duration: "2m 50s" },
  { id: 5, emotion: "sorprendido", confidence: 0.91, timestamp: "2024-01-15 14:20:15", duration: "1m 30s" },
  { id: 6, emotion: "enojado", confidence: 0.88, timestamp: "2024-01-15 14:18:45", duration: "2m 10s" },
  { id: 7, emotion: "amor", confidence: 0.93, timestamp: "2024-01-15 14:16:35", duration: "4m 05s" },
  { id: 8, emotion: "feliz", confidence: 0.90, timestamp: "2024-01-15 14:12:30", duration: "3m 15s" },
]

const emotionColors = {
  feliz: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30",
  triste: "bg-blue-500/20 text-blue-700 border-blue-500/30",
  neutral: "bg-gray-500/20 text-gray-700 border-gray-500/30",
  enojado: "bg-red-500/20 text-red-700 border-red-500/30",
  sorprendido: "bg-purple-500/20 text-purple-700 border-purple-500/30",
  amor: "bg-pink-500/20 text-pink-700 border-pink-500/30",
}

const emotionLabels = {
  feliz: "Feliz",
  triste: "Triste",
  neutral: "Neutral",
  enojado: "Enojado",
  sorprendido: "Sorprendido",
  amor: "Amor",
}

export default function HistoryPage() {
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

      <div className="grid lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Registros</p>
              <p className="text-2xl font-bold">{mockHistory.length}</p>
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
              <p className="text-2xl font-bold">21m</p>
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
              <p className="text-2xl font-bold">90.5%</p>
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
              <p className="text-sm font-bold">Hoy 14:30</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-6">Registros Recientes</h3>
        <div className="space-y-4">
          {mockHistory.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 rounded-lg border hover-lift transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <Badge
                  className={`px-3 py-1 ${emotionColors[record.emotion as keyof typeof emotionColors]}`}
                >
                  {emotionLabels[record.emotion as keyof typeof emotionLabels]}
                </Badge>
                <div>
                  <p className="font-medium">{record.timestamp}</p>
                  <p className="text-sm text-muted-foreground">Duración: {record.duration}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{(record.confidence * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">confianza</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
