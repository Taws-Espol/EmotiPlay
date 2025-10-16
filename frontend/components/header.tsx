"use client"

import * as React from "react"
import { MainNavigation, MobileNavigation } from "@/components/main-navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Sparkles } from "lucide-react"

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1">
            <MainNavigation />
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center flex-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                EmotiPlay
              </span>
            </div>
          </div>

          {/* Right side - Theme toggle and mobile menu */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Sparkles className="h-6 w-6 text-primary animate-pulse" />
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      EmotiPlay
                    </span>
                  </div>
                  <MobileNavigation />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
