import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Sparkles, 
  Camera, 
  Brain, 
  Music, 
  BarChart3, 
  Shield,
  Zap,
  Heart,
  Eye,
  Cpu
} from "lucide-react"

export default function InfoPage() {
  const features = [
    {
      icon: Camera,
      title: "Detección en tiempo real",
      description: "Análisis facial instantáneo con tecnología de IA avanzada",
      color: "text-primary"
    },
    {
      icon: Brain,
      title: "6 emociones diferentes",
      description: "Reconoce felicidad, tristeza, neutralidad, enojo, sorpresa y amor",
      color: "text-secondary"
    },
    {
      icon: Music,
      title: "Integración con Spotify",
      description: "Cambia automáticamente la música según tu estado emocional",
      color: "text-accent"
    },
    {
      icon: BarChart3,
      title: "Análisis estadístico",
      description: "Visualiza patrones y tendencias en tus emociones",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Privacidad garantizada",
      description: "Todos los datos se procesan localmente en tu dispositivo",
      color: "text-secondary"
    },
    {
      icon: Zap,
      title: "Alta precisión",
      description: "Algoritmos optimizados con más del 90% de precisión",
      color: "text-accent"
    }
  ]

  const emotions = [
    { name: "Feliz", icon: Heart, color: "bg-yellow-500/20 text-yellow-700 border-yellow-500/30", description: "Sonrisas y expresiones positivas" },
    { name: "Triste", icon: Heart, color: "bg-blue-500/20 text-blue-700 border-blue-500/30", description: "Expresiones melancólicas y bajas" },
    { name: "Neutral", icon: Eye, color: "bg-gray-500/20 text-gray-700 border-gray-500/30", description: "Estado equilibrado y calmado" },
    { name: "Enojado", icon: Heart, color: "bg-red-500/20 text-red-700 border-red-500/30", description: "Expresiones de frustración o ira" },
    { name: "Sorprendido", icon: Heart, color: "bg-purple-500/20 text-purple-700 border-purple-500/30", description: "Expresiones de asombro o sorpresa" },
    { name: "Amor", icon: Heart, color: "bg-pink-500/20 text-pink-700 border-pink-500/30", description: "Expresiones de cariño y afecto" }
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Información de EmotiPlay</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Acerca de EmotiPlay
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Una aplicación innovadora que utiliza inteligencia artificial para detectar emociones faciales 
          y crear experiencias musicales personalizadas
        </p>
      </div>

      {/* Características principales */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Características Principales</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="p-6 hover-lift transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br from-muted to-muted/50 ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Emociones detectadas */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Emociones Detectadas</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {emotions.map((emotion, index) => {
            const Icon = emotion.icon
            return (
              <Card key={index} className="p-4 hover-lift transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${emotion.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{emotion.name}</h3>
                    <p className="text-sm text-muted-foreground">{emotion.description}</p>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Información técnica */}
      <div className="grid lg:grid-cols-2 gap-6 mb-12">
        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Cpu className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Tecnología</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Framework</span>
              <span className="text-sm font-medium">Next.js 15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">IA</span>
              <span className="text-sm font-medium">MediaPipe Face Mesh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Procesamiento</span>
              <span className="text-sm font-medium">Tiempo real</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Precisión</span>
              <span className="text-sm font-medium">90%+</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover-lift">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Shield className="h-5 w-5 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold">Privacidad</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Procesamiento local</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Sin envío de datos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Cifrado de datos</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Control total del usuario</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Cómo usar */}
      <Card className="p-6 hover-lift">
        <h3 className="text-lg font-semibold mb-4 text-center">Cómo Usar EmotiPlay</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary">1</span>
            </div>
            <h4 className="font-semibold mb-2">Activa la Cámara</h4>
            <p className="text-sm text-muted-foreground">
              Haz clic en "Iniciar Cámara" para comenzar la detección
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-secondary">2</span>
            </div>
            <h4 className="font-semibold mb-2">Detecta Emociones</h4>
            <p className="text-sm text-muted-foreground">
              La IA analizará tu rostro y detectará tu emoción actual
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-accent">3</span>
            </div>
            <h4 className="font-semibold mb-2">Disfruta la Música</h4>
            <p className="text-sm text-muted-foreground">
              Spotify cambiará automáticamente según tu estado emocional
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
