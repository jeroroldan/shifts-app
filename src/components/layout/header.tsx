"use client"

import { Calendar, LogOut, User2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthUser } from "@/lib/auth-query"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme/theme-toggle"


export function Header() {
  const { data } = useAuthUser()
  const user = data as { name?: string; email: string } | null
  const router = useRouter()

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("auth-storage")
    }
    window.location.href = "/cliente"
  }

  return (
    <header className="bg-card border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
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
          {user ? (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
              <div className="flex items-center gap-1 sm:gap-2 bg-muted rounded-full px-2 py-1">
                <User2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[100px] sm:max-w-[160px]" title={user.name || user.email}>
                  {user.name || user.email}
                </span>
              </div>
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4 bg-transparent"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0">
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
