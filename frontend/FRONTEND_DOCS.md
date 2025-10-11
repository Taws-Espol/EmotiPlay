# Documentación del Frontend - EmotiPlay

## Índice
1. [Descripción General](#descripción-general)
2. [Tecnologías y Stack](#tecnologías-y-stack)
3. [Arquitectura](#arquitectura)
4. [Componentes Principales](#componentes-principales)
5. [Instalación y Configuración](#instalación-y-configuración)
6. [Estructura del Proyecto](#estructura-del-proyecto)
7. [Sistema de Estilos](#sistema-de-estilos)
8. [Integración con Backend](#integración-con-backend)
9. [Componentes UI](#componentes-ui)
10. [Estado y Gestión de Datos](#estado-y-gestión-de-datos)
11. [Personalización](#personalización)

## Descripción General

El frontend de EmotiPlay es una aplicación web moderna construida con Next.js 15 y React 19 que proporciona una interfaz de usuario intuitiva para el reconocimiento de emociones faciales en tiempo real con integración a Spotify.

### Características Principales

- **Interfaz moderna y animada**: Diseño fluido con animaciones CSS personalizadas
- **Captura de video en tiempo real**: Acceso a la cámara web mediante WebRTC
- **Visualización de datos**: Gráficos interactivos de emociones
- **Integración Spotify**: Reproductor simulado que cambia según la emoción
- **Diseño responsivo**: Adaptable a diferentes tamaños de pantalla
- **Modo oscuro/claro**: Soporte para temas mediante next-themes
- **TypeScript**: Tipado estático para mayor seguridad

## Tecnologías y Stack

### Core

```json
{
  "next": "15.2.4",              // Framework React con SSR
  "react": "19.2.0",             // Biblioteca de UI
  "react-dom": "19.2.0",         // Renderizado DOM
  "typescript": "5"              // Lenguaje con tipado estático
}
```

### Estilos

```json
{
  "tailwindcss": "4.1.9",        // Framework de CSS utility-first
  "@tailwindcss/postcss": "4.1.9",
  "tailwind-merge": "2.5.5",     // Fusión inteligente de clases
  "tailwindcss-animate": "1.0.7", // Animaciones predefinidas
  "class-variance-authority": "0.7.1" // Variantes de componentes
}
```

### UI Components

```json
{
  "@radix-ui/*": "latest",       // Componentes accesibles
  "lucide-react": "0.454.0",     // Sistema de iconos
  "recharts": "latest",           // Biblioteca de gráficos
  "sonner": "1.7.4"              // Sistema de notificaciones
}
```

### Formularios y Validación

```json
{
  "react-hook-form": "7.60.0",   // Gestión de formularios
  "@hookform/resolvers": "3.10.0",
  "zod": "3.25.76"               // Validación de esquemas
}
```

### Tipografía

```json
{
  "geist": "1.3.1"               // Fuente Geist de Vercel
}
```

## Arquitectura

```
frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Layout principal
│   ├── page.tsx               # Página principal
│   └── globals.css            # Estilos globales
│
├── components/                 # Componentes React
│   ├── emotion-recognition.tsx # Componente principal
│   ├── emotion-chart.tsx      # Gráfico de emociones
│   ├── emotion-history.tsx    # Historial de emociones
│   ├── spotify-player.tsx     # Reproductor de Spotify
│   ├── theme-provider.tsx     # Proveedor de tema
│   └── ui/                    # Componentes de UI base
│       ├── button.tsx
│       ├── card.tsx
│       ├── badge.tsx
│       └── ... (más componentes)
│
├── hooks/                      # Custom React Hooks
│   └── use-mobile.ts          # Hook para detección móvil
│
├── lib/                        # Utilidades
│   └── utils.ts               # Funciones auxiliares
│
├── public/                     # Archivos estáticos
│
├── package.json               # Dependencias
├── tsconfig.json              # Configuración TypeScript
├── next.config.mjs            # Configuración Next.js
├── tailwind.config.ts         # Configuración Tailwind
├── postcss.config.mjs         # Configuración PostCSS
└── components.json            # Configuración shadcn/ui
```

## Componentes Principales

### 1. EmotionRecognition

**Ubicación**: `components/emotion-recognition.tsx`

Componente principal que orquesta toda la funcionalidad de reconocimiento de emociones.

**Características**:
- Captura de video en tiempo real
- Detección simulada de emociones (cada 2 segundos)
- Gestión del estado de la aplicación
- Coordinación de subcomponentes

**Props**: Ninguna (componente independiente)

**Estado**:
```typescript
interface State {
  isActive: boolean              // Estado de la cámara
  currentEmotion: EmotionData | null // Emoción actual
  emotionHistory: EmotionData[]  // Historial de emociones
  spotifyEnabled: boolean        // Estado de Spotify
}
```

**Tipos**:
```typescript
type Emotion = "feliz" | "triste" | "neutral" | "enojado" | "sorprendido" | "amor"

interface EmotionData {
  emotion: Emotion
  confidence: number      // 0.0 - 1.0
  timestamp: Date
}
```

**Funciones principales**:

```typescript
// Iniciar cámara
const startCamera = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480 }
  })
  videoRef.current.srcObject = stream
  setIsActive(true)
}

// Detener cámara
const stopCamera = () => {
  const stream = videoRef.current.srcObject as MediaStream
  stream.getTracks().forEach(track => track.stop())
  setIsActive(false)
}

// Detectar emoción (simulado)
const detectEmotion = () => {
  const emotions: Emotion[] = ["feliz", "triste", "neutral", "enojado", "sorprendido", "amor"]
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
  const confidence = Math.random() * 0.3 + 0.7

  const emotionData: EmotionData = {
    emotion: randomEmotion,
    confidence,
    timestamp: new Date()
  }

  setCurrentEmotion(emotionData)
  setEmotionHistory(prev => [...prev.slice(-9), emotionData])
}
```

**Layout**:
```jsx
<div className="container">
  <header>
    {/* Título y descripción */}
  </header>

  <div className="grid lg:grid-cols-3">
    {/* Columna principal (2/3) */}
    <div className="lg:col-span-2">
      <VideoFeed />
      <SpotifyPlayer />
      <EmotionChart />
    </div>

    {/* Sidebar (1/3) */}
    <div>
      <CurrentEmotion />
      <SpotifyControl />
      <EmotionHistory />
      <InfoCard />
    </div>
  </div>
</div>
```

### 2. EmotionChart

**Ubicación**: `components/emotion-chart.tsx`

Gráfico de barras que muestra la distribución de emociones detectadas.

**Props**:
```typescript
interface Props {
  data: EmotionData[]
}
```

**Características**:
- Gráfico de barras con Recharts
- Colores específicos por emoción
- Animaciones suaves
- Tooltip interactivo

**Configuración de colores**:
```typescript
const emotionColors: Record<Emotion, string> = {
  feliz: "#eab308",        // Amarillo
  triste: "#3b82f6",       // Azul
  neutral: "#6b7280",      // Gris
  enojado: "#ef4444",      // Rojo
  sorprendido: "#a855f7",  // Púrpura
  amor: "#ec4899"          // Rosa
}
```

**Implementación**:
```typescript
// Contar ocurrencias de cada emoción
const emotionCounts = data.reduce((acc, item) => {
  acc[item.emotion] = (acc[item.emotion] || 0) + 1
  return acc
}, {} as Record<Emotion, number>)

// Preparar datos para el gráfico
const chartData = Object.entries(emotionCounts).map(([emotion, count]) => ({
  emotion: emotionLabels[emotion as Emotion],
  count,
  color: emotionColors[emotion as Emotion]
}))
```

### 3. EmotionHistory

**Ubicación**: `components/emotion-history.tsx`

Muestra el historial temporal de emociones detectadas en formato de lista.

**Props**:
```typescript
interface Props {
  data: EmotionData[]
}
```

**Características**:
- Lista de últimas 10 emociones
- Timestamp formateado
- Indicador de confianza
- Scroll automático

**Ejemplo de renderizado**:
```typescript
{data.slice().reverse().map((item, index) => (
  <div key={index} className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <EmotionIcon className={emotionColors[item.emotion]} />
      <div>
        <p className="font-medium">{emotionLabels[item.emotion]}</p>
        <p className="text-sm text-muted-foreground">
          {formatTime(item.timestamp)}
        </p>
      </div>
    </div>
    <Badge>{(item.confidence * 100).toFixed(0)}%</Badge>
  </div>
))}
```

### 4. SpotifyPlayer

**Ubicación**: `components/spotify-player.tsx`

Reproductor simulado de Spotify que adapta las playlists según la emoción.

**Props**:
```typescript
interface Props {
  currentEmotion?: Emotion
  enabled: boolean
}
```

**Playlists por emoción**:
```typescript
const emotionPlaylists = {
  feliz: {
    name: "Happy Vibes",
    id: "37i9dQZF1DXdPec7aLTmlC",
    description: "Música alegre y energética",
    color: "from-yellow-500/20 to-orange-500/20"
  },
  triste: {
    name: "Sad Songs",
    id: "37i9dQZF1DX7qK8ma5wgG1",
    description: "Música melancólica y reflexiva",
    color: "from-blue-500/20 to-indigo-500/20"
  },
  // ... más playlists
}
```

**Estados**:
```typescript
const [isPlaying, setIsPlaying] = useState(false)
const [currentTrack, setCurrentTrack] = useState<string>("Esperando emoción...")
```

**Efecto de cambio de playlist**:
```typescript
useEffect(() => {
  if (enabled && currentEmotion) {
    const playlist = emotionPlaylists[currentEmotion]
    setCurrentTrack(`Reproduciendo: ${playlist.name}`)
    setIsPlaying(true)
    console.log(`Cambiando a playlist: ${playlist.name}`)
  }
}, [currentEmotion, enabled])
```

**Componentes del reproductor**:
- Información de la playlist
- Barra de progreso animada
- Controles de reproducción (play/pause, skip)
- Control de volumen
- Badge de estado (Conectado)

## Instalación y Configuración

### Instalación

```bash
cd frontend

# Con npm
npm install

# Con pnpm (recomendado)
pnpm install

# Con yarn
yarn install
```

### Scripts Disponibles

```json
{
  "dev": "next dev",           // Servidor de desarrollo
  "build": "next build",       // Build de producción
  "start": "next start",       // Servidor de producción
  "lint": "next lint"          // Linter
}
```

### Ejecución

**Modo desarrollo**:
```bash
npm run dev
# Aplicación disponible en http://localhost:3000
```

**Build de producción**:
```bash
npm run build
npm start
```

### Variables de Entorno

Crear archivo `.env.local`:

```env
# API del backend (futuro)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Spotify API (para integración real)
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=tu_client_id
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=tu_client_secret
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback

# Analytics (opcional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=tu_analytics_id
```

## Estructura del Proyecto

### App Router (Next.js 15)

```
app/
├── layout.tsx              # Layout raíz
│   ├── HTML base
│   ├── Fuentes (Geist)
│   ├── Analytics
│   └── ThemeProvider
│
├── page.tsx                # Página principal
│   └── <EmotionRecognition />
│
└── globals.css             # Estilos globales
    ├── Variables CSS
    ├── @tailwind directives
    └── Animaciones custom
```

### Componentes

**Convenciones de nomenclatura**:
- `kebab-case.tsx` para componentes principales
- `PascalCase` para nombres de componentes exportados
- Componentes en `components/` para uso general
- Componentes en `components/ui/` para elementos reutilizables

**Estructura de componente**:
```typescript
"use client"  // Si requiere interactividad

import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ComponentProps {
  prop1: string
  prop2?: number
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  const [state, setState] = useState<string>("")

  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

## Sistema de Estilos

### Tailwind CSS 4

**Configuración**: `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        // ... más colores
      },
      animation: {
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" }
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(var(--primary), 0.5)" },
          "50%": { boxShadow: "0 0 30px rgba(var(--primary), 0.8)" }
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
}
```

### Variables CSS

**Ubicación**: `app/globals.css`

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --secondary: 210 40% 96.1%;
    --accent: 210 40% 96.1%;
    --muted: 210 40% 96.1%;
    /* ... más variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    /* ... más variables */
  }
}
```

### Clases Personalizadas

```css
@layer utilities {
  .hover-lift {
    @apply transition-transform duration-300 hover:-translate-y-1;
  }

  .glass-effect {
    @apply bg-background/80 backdrop-blur-md;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-primary via-secondary to-accent
           bg-clip-text text-transparent;
  }
}
```

## Integración con Backend

### Arquitectura Actual (Simulada)

Actualmente, el frontend funciona de manera autónoma con datos simulados:

```typescript
// Simulación de detección de emociones
const detectEmotion = () => {
  const emotions: Emotion[] = ["feliz", "triste", "neutral", "enojado", "sorprendido", "amor"]
  const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)]
  const confidence = Math.random() * 0.3 + 0.7

  return {
    emotion: randomEmotion,
    confidence,
    timestamp: new Date()
  }
}
```

### Integración Futura (API REST)

**Estructura propuesta**:

```typescript
// lib/api.ts
export class EmotionAPI {
  private baseURL: string

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }

  async analyzeFrame(imageData: Blob): Promise<EmotionData> {
    const formData = new FormData()
    formData.append('image', imageData)

    const response = await fetch(`${this.baseURL}/api/analyze`, {
      method: 'POST',
      body: formData
    })

    return response.json()
  }

  async startStream(streamId: string): Promise<void> {
    await fetch(`${this.baseURL}/api/stream/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamId })
    })
  }
}
```

**Uso en componente**:

```typescript
import { EmotionAPI } from '@/lib/api'

const api = new EmotionAPI()

const captureAndAnalyze = async () => {
  if (!videoRef.current) return

  // Capturar frame del video
  const canvas = document.createElement('canvas')
  canvas.width = videoRef.current.videoWidth
  canvas.height = videoRef.current.videoHeight
  const ctx = canvas.getContext('2d')
  ctx?.drawImage(videoRef.current, 0, 0)

  // Convertir a Blob
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/jpeg')
  })

  // Enviar al backend
  const result = await api.analyzeFrame(blob)
  setCurrentEmotion(result)
}
```

### WebSocket (Tiempo Real)

```typescript
// lib/websocket.ts
export class EmotionWebSocket {
  private ws: WebSocket | null = null

  connect(onEmotion: (data: EmotionData) => void) {
    this.ws = new WebSocket('ws://localhost:8000/ws/emotions')

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onEmotion(data)
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  sendFrame(frameData: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ frame: frameData }))
    }
  }

  disconnect() {
    this.ws?.close()
  }
}
```

## Componentes UI

### Componentes Base (shadcn/ui)

Ubicados en `components/ui/`, basados en Radix UI:

**Button**:
```typescript
<Button
  variant="default | destructive | outline | ghost"
  size="default | sm | lg | icon"
>
  Click me
</Button>
```

**Card**:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

**Badge**:
```typescript
<Badge variant="default | secondary | destructive | outline">
  Badge text
</Badge>
```

### Personalización de Componentes

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

## Estado y Gestión de Datos

### useState para Estado Local

```typescript
const [isActive, setIsActive] = useState(false)
const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null)
```

### useEffect para Efectos Secundarios

```typescript
// Iniciar detección cuando la cámara está activa
useEffect(() => {
  if (!isActive) return

  const interval = setInterval(detectEmotion, 2000)
  return () => clearInterval(interval)
}, [isActive])

// Cleanup al desmontar
useEffect(() => {
  return () => {
    stopCamera()
  }
}, [])
```

### useRef para Referencias DOM

```typescript
const videoRef = useRef<HTMLVideoElement>(null)
const canvasRef = useRef<HTMLCanvasElement>(null)

// Acceder al elemento
videoRef.current?.play()
```

### Context API (Futuro)

```typescript
// contexts/EmotionContext.tsx
import { createContext, useContext, useState } from 'react'

interface EmotionContextType {
  emotions: EmotionData[]
  addEmotion: (emotion: EmotionData) => void
}

const EmotionContext = createContext<EmotionContextType | undefined>(undefined)

export function EmotionProvider({ children }: { children: React.ReactNode }) {
  const [emotions, setEmotions] = useState<EmotionData[]>([])

  const addEmotion = (emotion: EmotionData) => {
    setEmotions(prev => [...prev.slice(-99), emotion])
  }

  return (
    <EmotionContext.Provider value={{ emotions, addEmotion }}>
      {children}
    </EmotionContext.Provider>
  )
}

export function useEmotions() {
  const context = useContext(EmotionContext)
  if (!context) throw new Error('useEmotions must be used within EmotionProvider')
  return context
}
```

## Personalización

### Agregar Nueva Emoción

1. **Actualizar tipos**:
```typescript
type Emotion = "feliz" | "triste" | "neutral" | "enojado" | "sorprendido" | "amor" | "confundido"
```

2. **Agregar configuración**:
```typescript
const emotionIcons = {
  // ... emociones existentes
  confundido: HelpCircle
}

const emotionColors = {
  // ... colores existentes
  confundido: "text-orange-500"
}

const emotionLabels = {
  // ... etiquetas existentes
  confundido: "Confundido"
}
```

3. **Agregar playlist de Spotify**:
```typescript
const emotionPlaylists = {
  // ... playlists existentes
  confundido: {
    name: "Thinking Music",
    id: "spotify_id",
    description: "Música para pensar",
    color: "from-orange-500/20 to-amber-500/20"
  }
}
```

### Personalizar Tema

**Modificar `app/globals.css`**:

```css
:root {
  --primary: 250 100% 60%;        /* Cambiar color primario */
  --secondary: 180 100% 50%;      /* Color secundario */
  --accent: 30 100% 55%;          /* Color de acento */
}
```

### Añadir Animación Custom

```css
/* globals.css */
@keyframes bounce-in {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
```

```typescript
// tailwind.config.ts
animation: {
  "bounce-in": "bounce-in 0.6s ease-out"
}
```

```tsx
// Usar en componente
<div className="animate-bounce-in">
  Content
</div>
```

## Testing (Recomendado)

### Setup de Testing

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

### Ejemplo de Test

```typescript
// __tests__/EmotionChart.test.tsx
import { render, screen } from '@testing-library/react'
import EmotionChart from '@/components/emotion-chart'

describe('EmotionChart', () => {
  it('renders chart with emotion data', () => {
    const mockData = [
      { emotion: 'feliz', confidence: 0.9, timestamp: new Date() }
    ]

    render(<EmotionChart data={mockData} />)

    expect(screen.getByText('Distribución de Emociones')).toBeInTheDocument()
  })
})
```

## Optimización

### Lazy Loading

```typescript
import dynamic from 'next/dynamic'

const EmotionChart = dynamic(() => import('@/components/emotion-chart'), {
  loading: () => <div>Cargando gráfico...</div>,
  ssr: false
})
```

### Memoización

```typescript
import { memo, useMemo } from 'react'

const EmotionChart = memo(({ data }: Props) => {
  const chartData = useMemo(() => {
    return processData(data)
  }, [data])

  return <Chart data={chartData} />
})
```

### Image Optimization

```typescript
import Image from 'next/image'

<Image
  src="/emotion-icon.png"
  alt="Emotion"
  width={50}
  height={50}
  priority
/>
```

## Deployment

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Build Local

```bash
npm run build
npm start
```

### Docker

```dockerfile
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

## Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Radix UI](https://www.radix-ui.com)
- [shadcn/ui](https://ui.shadcn.com)

---

**Última actualización**: 2025-10-11
