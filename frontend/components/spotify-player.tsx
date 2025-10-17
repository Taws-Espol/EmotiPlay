"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Play, Pause, SkipForward, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Emotion = "feliz" | "triste" | "neutral" | "enojado" | "sorprendido" | "disgusto" | "miedo"

interface SpotifyPlayerProps {
  currentEmotion?: Emotion
  enabled: boolean
  onToggleEnabled?: () => void
}

// Playlists de Spotify según emociones
const emotionPlaylists = {
  feliz: {
    name: "Happy Vibes",
    id: "37i9dQZF1DXdPec7aLTmlC",
    description: "Música alegre y energética",
    color: "from-yellow-500/20 to-orange-500/20",
  },
  triste: {
    name: "Sad Songs",
    id: "37i9dQZF1DX7qK8ma5wgG1",
    description: "Música melancólica y reflexiva",
    color: "from-blue-500/20 to-indigo-500/20",
  },
  neutral: {
    name: "Chill Vibes",
    id: "37i9dQZF1DX4WYpdgoIcn6",
    description: "Música relajante y tranquila",
    color: "from-gray-500/20 to-slate-500/20",
  },
  enojado: {
    name: "Intense Energy",
    id: "37i9dQZF1DX1tyCD9QhIWF",
    description: "Música intensa y poderosa",
    color: "from-red-500/20 to-rose-500/20",
  },
  sorprendido: {
    name: "Upbeat Mix",
    id: "37i9dQZF1DXaXB8fQg7xif",
    description: "Música sorprendente y dinámica",
    color: "from-purple-500/20 to-violet-500/20",
  },
  disgusto: {
    name: "Dark Vibes",
    id: "37i9dQZF1DX1lVhptIYRda",
    description: "Música oscura e intensa",
    color: "from-green-600/20 to-emerald-700/20",
  },
  miedo: {
    name: "Thriller Soundtrack",
    id: "37i9dQZF1DWXm2TVmPWT5O",
    description: "Música misteriosa y suspense",
    color: "from-purple-800/20 to-indigo-900/20",
  },
}

export default function SpotifyPlayer({ currentEmotion, enabled, onToggleEnabled }: SpotifyPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<string>("Esperando emoción...")

  useEffect(() => {
    if (enabled && currentEmotion) {
      const playlist = emotionPlaylists[currentEmotion]
      setCurrentTrack(`Reproduciendo: ${playlist.name}`)
      setIsPlaying(true)

      console.log(`[v0] Cambiando a playlist: ${playlist.name} (${playlist.id})`)
    }
  }, [currentEmotion, enabled])

  if (!enabled) {
    return (
      <Card className="p-6 border-2 shadow-xl bg-gradient-to-br from-card to-muted/30 hover-lift transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-muted-foreground">
            <Music className="w-12 h-12 opacity-50 animate-float" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Spotify Desactivado</h3>
              <p className="text-sm">Activa Spotify para cambiar música según tu emoción</p>
            </div>
          </div>
          {onToggleEnabled && (
            <Button
              onClick={onToggleEnabled}
              className="transition-all duration-300 hover:scale-105 bg-green-500 hover:bg-green-600"
            >
              Activar Spotify
            </Button>
          )}
        </div>
      </Card>
    )
  }

  const playlist = currentEmotion ? emotionPlaylists[currentEmotion] : null

  return (
    <Card
      className={`p-6 border-2 shadow-xl bg-gradient-to-br ${playlist?.color || "from-card to-muted/30"} hover-lift transition-all duration-500 animate-scale-in`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-500 rounded-full animate-pulse-glow">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{playlist?.name || "Spotify Player"}</h3>
            <p className="text-sm text-muted-foreground">{playlist?.description || "Esperando emoción..."}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-500/10 border-green-500/50 animate-scale-in">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Conectado
          </Badge>
          {onToggleEnabled && (
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleEnabled}
              className="transition-all duration-300 hover:scale-105 border-red-500/50 hover:bg-red-500/10 hover:border-red-500"
            >
              Desactivar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-card/50 backdrop-blur-sm rounded-lg p-4 transition-all duration-300 hover:bg-card/70">
          <p className="text-sm font-medium mb-2">{currentTrack}</p>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full relative overflow-hidden transition-all duration-500"
              style={{ width: "45%" }}
            >
              <div className="absolute inset-0 animate-shimmer" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-transparent transition-all duration-300 hover:scale-110 hover:bg-card"
          >
            <SkipForward className="w-4 h-4 rotate-180" />
          </Button>
          <Button
            size="icon"
            className="rounded-full w-12 h-12 bg-green-500 hover:bg-green-600 transition-all duration-300 hover:scale-110 animate-pulse-glow"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-5 h-5" fill="white" /> : <Play className="w-5 h-5" fill="white" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full bg-transparent transition-all duration-300 hover:scale-110 hover:bg-card"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Volume Indicator - Smaller and more aesthetic */}
          <div className="flex items-center gap-2 flex-1">
            <Volume2 className="w-3 h-3 text-muted-foreground/70" />
            <div className="flex-1 bg-muted/50 rounded-full h-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full transition-all duration-300"
                style={{ width: "70%" }}
              />
            </div>
          </div>

          {/* Emotion Identified - Right side */}
          {currentEmotion && (
            <div className="text-right animate-slide-up">
              <div className="text-sm font-semibold text-foreground mb-2">Emoción Identificada</div>
              <div className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent capitalize mb-1">
                {currentEmotion}
              </div>
              <div className="text-xs text-muted-foreground">Playlist elegida para esta emoción</div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
