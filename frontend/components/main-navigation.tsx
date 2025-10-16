"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Home, 
  BarChart3, 
  History, 
  Settings,
  Sparkles
} from "lucide-react"

const navigation = [
  {
    name: "Inicio",
    href: "/",
    icon: Home,
    description: "Detección de emociones"
  },
  {
    name: "Estadísticas",
    href: "/analytics",
    icon: BarChart3,
    description: "Análisis de emociones"
  },
  {
    name: "Historial",
    href: "/history",
    icon: History,
    description: "Registro de emociones"
  },
  {
    name: "Información",
    href: "/info",
    icon: Settings,
    description: "Información de la aplicación"
  }
]

interface MainNavigationProps {
  className?: string
}

export function MainNavigation({ className }: MainNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex items-center space-x-1", className)}>
      <div className="flex items-center space-x-2 mr-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            EmotiPlay
          </span>
        </div>
      </div>
      
      <div className="hidden md:flex items-center space-x-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Button
              key={item.name}
              asChild
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "transition-all duration-200 hover:scale-105",
                isActive && "bg-primary/10 text-primary border border-primary/20"
              )}
            >
              <Link href={item.href} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            </Button>
          )
        })}
      </div>
    </nav>
  )
}

interface MobileNavigationProps {
  className?: string
}

export function MobileNavigation({ className }: MobileNavigationProps) {
  const pathname = usePathname()

  return (
    <div className={cn("md:hidden", className)}>
      <div className="flex flex-wrap gap-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Button
              key={item.name}
              asChild
              variant={isActive ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex-1 min-w-0 transition-all duration-200",
                isActive && "bg-primary/10 text-primary border-primary/20"
              )}
            >
              <Link href={item.href} className="flex flex-col items-center gap-1 p-2">
                <Icon className="h-4 w-4" />
                <span className="text-xs">{item.name}</span>
              </Link>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
