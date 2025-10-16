import { Card } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react"

export default function Analytics() {
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

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Detecciones</p>
              <p className="text-2xl font-bold">1,234</p>
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
              <p className="text-2xl font-bold">Feliz</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Sesiones Hoy</p>
              <p className="text-2xl font-bold">12</p>
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
              <p className="text-2xl font-bold">94.2%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribución de Emociones</h3>
          <div className="space-y-4">
            {[
              { emotion: "Feliz", percentage: 35, color: "bg-yellow-500" },
              { emotion: "Neutral", percentage: 25, color: "bg-gray-500" },
              { emotion: "Triste", percentage: 15, color: "bg-blue-500" },
              { emotion: "Enojado", percentage: 10, color: "bg-red-500" },
              { emotion: "Sorprendido", percentage: 10, color: "bg-purple-500" },
              { emotion: "Amor", percentage: 5, color: "bg-pink-500" },
            ].map((item) => (
              <div key={item.emotion} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.emotion}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tendencias Semanales</h3>
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Gráfico de tendencias próximamente...</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
