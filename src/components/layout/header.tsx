"use client"

import { Calendar, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth-store"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme/theme-toggle"

export function Header() {
  const { isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/cliente")
  }

  return (
    <header className="bg-card border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-primary rounded-lg">
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-foreground">Gestión de Turnos</h1>
              <p className="text-muted-foreground text-xs sm:text-sm hidden sm:block">
                Sistema moderno de administración de citas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 bg-transparent"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
