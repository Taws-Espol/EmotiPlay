"use client"

import { useState, useRef, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, VideoOff, Smile, Frown, Meh, Angry, Sunrise as Surprise, Heart, Music, Sparkles, Eye, AlertCircle } from "lucide-react"
import EmotionChart from "./emotion-chart"
import EmotionHistory from "./emotion-history"
import SpotifyPlayer from "./spotify-player"

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
  feliz: "text-amber-400",
  triste: "text-blue-400",
  neutral: "text-gray-400",
  enojado: "text-red-400",
  sorprendido: "text-violet-400",
  amor: "text-pink-400",
}

const emotionLabels = {
  feliz: "Feliz",
  triste: "Triste",
  neutral: "Neutral",
  enojado: "Enojado",
  sorprendido: "Sorprendido",
  amor: "Amor",
}

type CameraStatus = "detecting" | "no-face" | "error"

export default function EmotionRecognition() {
  const [isActive, setIsActive] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null)
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([])
  const [spotifyEnabled, setSpotifyEnabled] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("detecting")
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const detectEmotion = () => {
    // Simular diferentes estados de detección
    /* //Solo colocado para efectos de visualización
    const randomState = Math.random()
    
    if (randomState < 0.1) {
      // 10% - Sin rostro detectado
      setCameraStatus("no-face")
      setCurrentEmotion(null)
      return
    }
    
    if (randomState < 0.15) {
      // 5% - Error de detección
      setCameraStatus("error")
      setCurrentEmotion(null)
      return
    }
    
    // 85% - Detección exitosa
    setCameraStatus("detecting")
    */
    const emotions: Emotion[] = ["feliz", "triste", "neutral", "enojado", "sorprendido", "amor"]
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
    const confidence = Math.random() * 0.3 + 0.7 // 70-100%

    const emotionData: EmotionData = {
      emotion: randomEmotion,
      confidence,
      timestamp: new Date(),
    }

    setCurrentEmotion(emotionData)
    setEmotionHistory((prev) => [...prev.slice(-9), emotionData])
  }

  const startCamera = async () => {
    try {
      setCameraStatus("detecting")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsActive(true)
        setCameraStatus("detecting")

        const interval = setInterval(detectEmotion, 2000)
        return () => clearInterval(interval)
      }
    } catch (error) {
      console.error("Error al acceder a la cámara:", error)
      setCameraStatus("error")
      alert("No se pudo acceder a la cámara. Por favor, verifica los permisos.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsActive(false)
      setCurrentEmotion(null)
    }
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

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-all duration-500 ${!isActive ? "hidden" : "animate-scale-in"}`}
              />
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
              {!isActive && (
                <div className="text-center text-muted-foreground p-8 animate-float">
                  <VideoOff className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Activa la cámara para comenzar</p>
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
                      Detener Cámara
                    </>
                  ) : (
                    <>
                      <Video className="mr-2 h-5 w-5" />
                      Iniciar Cámara
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
