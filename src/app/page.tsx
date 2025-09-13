"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Siempre redirigir a /cliente, nunca a /admin automáticamente
    router.replace("/cliente")
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirigiendo...</h1>
        <p className="text-muted-foreground">Cargando la aplicación de turnos</p>
      </div>
    </div>
  )
}
