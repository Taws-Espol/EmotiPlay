"use client"

import { useState, useRef, useEffect } from "react"
import { EmotionWebSocket } from "@/lib/websocket"
import { playEmotion } from "@/lib/spotify-client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, VideoOff, Smile, Frown, Meh, Angry, Sunrise as Surprise, Frown as Disgust, Zap as Fear, Sparkles, Eye, AlertCircle } from "lucide-react"
import EmotionChart from "./emotion-chart"
import EmotionHistory from "./emotion-history"
import SpotifyPlayer from "./spotify-player"

type Emotion = "feliz" | "triste" | "neutral" | "enojado" | "sorprendido" | "disgusto" | "miedo"

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
  disgusto: Disgust,
  miedo: Fear,
}

const emotionColors = {
  feliz: "text-amber-400",
  triste: "text-blue-400",
  neutral: "text-gray-400",
  enojado: "text-red-400",
  sorprendido: "text-violet-400",
  disgusto: "text-green-500",
  miedo: "text-purple-700",
}

const emotionLabels = {
  feliz: "Feliz",
  triste: "Triste",
  neutral: "Neutral",
  enojado: "Enojado",
  sorprendido: "Sorprendido",
  disgusto: "Disgusto",
  miedo: "Miedo",
}

type CameraStatus = "detecting" | "no-face" | "error"

export default function EmotionRecognition() {
  const [isActive, setIsActive] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null)
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([])
  const [spotifyEnabled, setSpotifyEnabled] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("detecting")
  const wsRef = useRef<EmotionWebSocket | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const lastUpdateTimeRef = useRef<number>(0)
  const lastEmotionRef = useRef<string>("")
  const lastSpotifyEmotionRef = useRef<string>("")

  const startCamera = async () => {
    try {
      setCameraStatus("detecting")
      setIsActive(true)

      // Conectar WebSocket al backend
      const ws = new EmotionWebSocket(
        process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/api/ws/emotions/detect'
      )

      ws.connect(
        // Callback para emociones detectadas (con throttling)
        (emotionData) => {
          const now = Date.now()
          const timeSinceLastUpdate = now - lastUpdateTimeRef.current

          // Solo actualizar si ha pasado al menos 1 segundo O si cambió la emoción
          if (timeSinceLastUpdate >= 1000 || lastEmotionRef.current !== emotionData.emotion) {
            setCurrentEmotion(emotionData)

            // Solo agregar al historial si cambió la emoción
            if (lastEmotionRef.current !== emotionData.emotion) {
              setEmotionHistory((prev) => [...prev.slice(-9), emotionData])

              // Cambiar música de Spotify si está habilitado y cambió la emoción
              if (spotifyEnabled && lastSpotifyEmotionRef.current !== emotionData.emotion) {
                playEmotion(emotionData.emotion).then(success => {
                  if (success) {
                    console.log(`[Spotify] Cambiando música a: ${emotionData.emotion}`)
                    lastSpotifyEmotionRef.current = emotionData.emotion
                  }
                })
              }
            }

            setCameraStatus("detecting")
            lastUpdateTimeRef.current = now
            lastEmotionRef.current = emotionData.emotion
          }
        },
        // Callback para frames procesados (CON bounding boxes)
        // ✅ Simple como index.html - actualiza img.src directamente
        (frameBase64) => {
          if (imgRef.current) {
            imgRef.current.src = `data:image/jpeg;base64,${frameBase64}`
          }
        }
      )

      wsRef.current = ws

    } catch (error) {
      console.error("Error al conectar al sistema de detección:", error)
      setCameraStatus("error")
      alert("No se pudo conectar al sistema de detección. Asegúrate de que el backend esté corriendo.")
    }
  }

  const stopCamera = () => {
    if (wsRef.current) {
      wsRef.current.disconnect()
      wsRef.current = null
    }

    setIsActive(false)
    setCurrentEmotion(null)
    setCameraStatus("detecting")

    // Limpiar refs
    lastUpdateTimeRef.current = 0
    lastEmotionRef.current = ""
    lastSpotifyEmotionRef.current = ""
  }

  const toggleCamera = () => {
    if (isActive) {
      stopCamera()
    } else {
      startCamera()
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const EmotionIcon = currentEmotion ? emotionIcons[currentEmotion.emotion] : Smile

  const getStatusNotification = () => {
    if (!isActive) return null

    const statusConfig = {
      detecting: {
        icon: Eye,
        text: "Detectando emociones...",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
        iconColor: "text-blue-500"
      },
      "no-face": {
        icon: AlertCircle,
        text: "No se detecta rostro",
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        borderColor: "border-yellow-500/20",
        iconColor: "text-yellow-500"
      },
      error: {
        icon: AlertCircle,
        text: "Error en la detección",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/20",
        iconColor: "text-red-500"
      },
    }

    const config = statusConfig[cameraStatus]
    const Icon = config.icon

    return (
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${config.bgColor} ${config.borderColor} animate-slide-up`}>
        <Icon className={`w-5 h-5 ${config.iconColor} animate-pulse`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-12 animate-slide-up">
        <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Detección en tiempo real con IA</span>
        </div>
        <h1 className="text-5xl font-bold mb-4 text-balance bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-rotate-gradient">
          Reconocimiento de Emociones Faciales
        </h1>
        <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
          Detecta emociones en tiempo real y cambia la música de Spotify según tu estado de ánimo
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Feed */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border-2 shadow-xl bg-gradient-to-br from-card to-muted/30 hover-lift transition-all duration-300">
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              {isActive && (
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/30 rounded-full blur-3xl animate-float" />
                  <div
                    className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-secondary/30 rounded-full blur-3xl animate-float"
                    style={{ animationDelay: "1s" }}
                  />
                  <div
                    className="absolute top-1/2 right-1/3 w-24 h-24 bg-accent/30 rounded-full blur-3xl animate-float"
                    style={{ animationDelay: "2s" }}
                  />
                </div>
              )}

              {/* Imagen para mostrar frame del backend (con bounding boxes) */}
              {/* ✅ Simple como index.html - el navegador optimiza automáticamente */}
              <img
                ref={imgRef}
                alt="Detección de emociones en tiempo real"
                className={`w-full h-full object-cover transition-all duration-500 ${!isActive ? "hidden" : "animate-scale-in"}`}
              />
              {!isActive && (
                <div className="text-center text-muted-foreground p-8 animate-float">
                  <VideoOff className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Conecta al sistema de detección para comenzar</p>
                </div>
              )}
            </div>

            {/* Status Notification */}
            {getStatusNotification()}

            <div className="p-6 bg-card/95 backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4">
                <Button
                  onClick={toggleCamera}
                  size="lg"
                  className="flex-1 transition-all duration-300 hover:scale-105"
                  variant={isActive ? "destructive" : "default"}
                >
                  {isActive ? (
                    <>
                      <VideoOff className="mr-2 h-5 w-5" />
                      Detener Detección
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-5 w-5" />
                      Iniciar Detección
                    </>
                  )}
                </Button>

                {isActive && (
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm border-green-500/50 bg-green-500/10 animate-scale-in"
                  >
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    En vivo
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Spotify Player */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <SpotifyPlayer 
              currentEmotion={currentEmotion?.emotion} 
              enabled={spotifyEnabled} 
              onToggleEnabled={() => setSpotifyEnabled(!spotifyEnabled)}
            />
          </div>

          {/* Emotion Chart */}
          {emotionHistory.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <EmotionChart data={emotionHistory} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Emotion */}
          <Card className="p-6 shadow-xl border-2 bg-gradient-to-br from-card to-primary/5 hover-lift animate-slide-up">
            <h2 className="text-xl font-semibold mb-4">Emoción Actual</h2>
            {currentEmotion ? (
              <div className="space-y-4 animate-scale-in">
                <div className="flex items-center justify-center">
                  <div
                    className={`p-8 rounded-full bg-gradient-to-br from-muted to-muted/50 ${emotionColors[currentEmotion.emotion]} animate-pulse-glow transition-all duration-500`}
                  >
                    <EmotionIcon className="w-20 h-20 animate-float" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {emotionLabels[currentEmotion.emotion]}
                  </h3>
                  <p className="text-muted-foreground">Confianza: {(currentEmotion.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary via-secondary to-accent h-full rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ width: `${currentEmotion.confidence * 100}%` }}
                  >
                    <div className="absolute inset-0 animate-shimmer" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground animate-float">
                <Meh className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Esperando detección...</p>
              </div>
            )}
          </Card>


          {/* Emotion History */}
          {emotionHistory.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <EmotionHistory data={emotionHistory} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
