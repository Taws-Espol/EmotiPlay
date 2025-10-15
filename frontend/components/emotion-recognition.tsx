// frontend/components/emotion-recognition.tsx

"use client"

import { useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Video, VideoOff, Smile, Frown, Meh, Angry, Zap as Surprise, Heart, Music, Sparkles, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import EmotionChart from "./emotion-chart"
import EmotionHistory from "./emotion-history"
import SpotifyPlayer from "./spotify-player"
import { useCamera } from "@/hooks/use-camera"
import { useEmotionDetection } from "@/hooks/use-emotion-detection"
import { useEmotionHistory } from "@/hooks/use-emotion-history"

type Emotion = "feliz" | "triste" | "neutral" | "enojado" | "sorprendido" | "amor"

const emotionIcons = {
  feliz: Smile,
  triste: Frown,
  neutral: Meh,
  enojado: Angry,
  sorprendido: Surprise,
  amor: Heart,
}

const emotionColors = {
  feliz: "text-yellow-500",
  triste: "text-blue-500",
  neutral: "text-gray-500",
  enojado: "text-red-500",
  sorprendido: "text-purple-500",
  amor: "text-pink-500",
}

const emotionLabels = {
  feliz: "Feliz",
  triste: "Triste",
  neutral: "Neutral",
  enojado: "Enojado",
  sorprendido: "Sorprendido",
  amor: "Amor",
}

export default function EmotionRecognition() {
  const { 
    videoRef, 
    canvasRef, 
    isActive, 
    error: cameraError, 
    startCamera, 
    stopCamera, 
    captureFrame,
    hasPermission 
  } = useCamera()
  
  const { 
    currentEmotion, 
    isDetecting, 
    isConnected,
    error: detectionError, 
    startDetection, 
    stopDetection 
  } = useEmotionDetection({
    interval: 2000,
  })

  const { history, addEmotion, getStats } = useEmotionHistory()

  // Agregar emoción al historial cuando se detecte
  useEffect(() => {
    if (currentEmotion) {
      addEmotion(currentEmotion)
    }
  }, [currentEmotion, addEmotion])

  // Toggle camera
  const handleToggleCamera = async () => {
    if (isActive) {
      stopCamera()
      stopDetection()
    } else {
      await startCamera()
    }
  }

  // Iniciar/detener detección cuando la cámara cambie de estado
  useEffect(() => {
    if (isActive && !isDetecting) {
      startDetection(captureFrame)
    } else if (!isActive && isDetecting) {
      stopDetection()
    }
  }, [isActive, isDetecting, startDetection, stopDetection, captureFrame])
  
  const EmotionIcon = currentEmotion && emotionIcons[currentEmotion.emotion] ? emotionIcons[currentEmotion.emotion] : Meh
  const stats = getStats()

  // DEBUG: detectar imports/exports undefined
  useEffect(() => {
    const suspects: Record<string, any> = {
      Card, Button, Badge, Alert, AlertDescription,
      Video, VideoOff, Smile, Frown, Meh, Angry, Surprise, Heart, Sparkles, AlertCircle,
      EmotionChart, EmotionHistory, SpotifyPlayer,
      useCamera, useEmotionDetection, useEmotionHistory,
    }

    Object.entries(suspects).forEach(([name, val]) => {
      if (val === undefined) {
        console.error(`IMPORT INVALIDO: ${name} is undefined`)
      } else {
        console.debug(`IMPORT OK: ${name}`)
      }
    })
  }, [])

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
              {/* Efectos de fondo animados */}
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

              {/* Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-all duration-500 ${!isActive ? "hidden" : "animate-scale-in"}`}
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Placeholder cuando no hay video */}
              {!isActive && (
                <div className="text-center text-muted-foreground p-8 animate-float">
                  <VideoOff className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Activa la cámara para comenzar</p>
                  {!hasPermission && (
                    <p className="text-sm mt-2">Se solicitarán permisos de cámara</p>
                  )}
                </div>
              )}

              {/* Overlay con emoción actual */}
              {currentEmotion && isActive && (
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <EmotionIcon className={`w-6 h-6 ${emotionColors[currentEmotion.emotion]}`} />
                    <div>
                      <p className="text-white font-semibold text-sm">
                        {emotionLabels[currentEmotion.emotion]}
                      </p>
                      <p className="text-white/70 text-xs">
                        {(currentEmotion.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Badge de estado de conexión */}
              {isActive && (
                <div className="absolute top-4 right-4 flex gap-2">
                  <Badge
                    variant="outline"
                    className={`px-4 py-2 text-sm animate-scale-in ${
                      isConnected 
                        ? 'border-green-500/50 bg-green-500/10' 
                        : 'border-yellow-500/50 bg-yellow-500/10'
                    }`}
                  >
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                        isConnected ? 'bg-green-400' : 'bg-yellow-400'
                      } opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        isConnected ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></span>
                    </span>
                    {isConnected ? 'Conectado' : 'Conectando...'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Controles */}
            <div className="p-6 bg-card/95 backdrop-blur-sm">
              {/* Alertas de error */}
              {(cameraError || detectionError) && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {cameraError || detectionError}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between gap-4">
                <Button
                  onClick={handleToggleCamera}
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

                {isActive && isDetecting && (
                  <Badge
                    variant="outline"
                    className="px-4 py-2 text-sm border-blue-500/50 bg-blue-500/10 animate-scale-in"
                  >
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Detectando
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          {/* Spotify Player */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <SpotifyPlayer currentEmotion={currentEmotion?.emotion} enabled={false} />
          </div>

          {/* Emotion Chart */}
          {history.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <EmotionChart data={history} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Emoción Actual */}
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
                  <p className="text-muted-foreground">
                    Confianza: {(currentEmotion.confidence * 100).toFixed(1)}%
                  </p>
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

          {/* Estadísticas */}
          {stats.total > 0 && (
            <Card className="p-6 shadow-xl border-2 hover-lift animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-xl font-semibold mb-4">Estadísticas</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total detectado</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Emoción dominante</span>
                  <Badge variant="outline" className="font-semibold">
                    {stats.dominant ? emotionLabels[stats.dominant] : 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Confianza promedio</span>
                  <span className="font-semibold">{(stats.averageConfidence * 100).toFixed(1)}%</span>
                </div>
              </div>
            </Card>
          )}

          {/* Emotion History */}
          {history.length > 0 && (
            <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <EmotionHistory data={history} />
            </div>
          )}

          {/* Info Card */}
          <Card
            className="p-6 glass-effect hover-lift animate-slide-up transition-all duration-300"
            style={{ animationDelay: "0.3s" }}
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              Información
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Detección en tiempo real
              </li>
              <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                6 emociones diferentes
              </li>
              <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0.4s" }} />
                Análisis cada 2 segundos
              </li>
              <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                  style={{ animationDelay: "0.6s" }}
                />
                WebSocket en tiempo real
              </li>
              <li className="flex items-center gap-2 transition-all duration-200 hover:translate-x-1">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"
                  style={{ animationDelay: "0.8s" }}
                />
                Historial de sesión
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}