"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { AppointmentForm } from "@/components/forms/appointment-form"
import { AvailableSlots } from "@/components/client/available-slots"
import { MyAppointments } from "@/components/client/my-appointments"
import { Calendar, Clock, User, LogIn } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ClientPage() {
  const [activeTab, setActiveTab] = useState("available")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleFormSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const tabs = [
    { id: "available", label: "Horarios Disponibles", icon: Clock },
    { id: "book", label: "Reservar Turno", icon: Calendar },
    { id: "my-appointments", label: "Mis Turnos", icon: User },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "available":
        return <AvailableSlots key={refreshKey} />
      case "book":
        return <AppointmentForm onSuccess={handleFormSuccess} />
      case "my-appointments":
        return <MyAppointments key={refreshKey} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Client Navigation */}
      <nav className="bg-card border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-3 text-xs sm:text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap",
                    "hover:bg-accent hover:text-accent-foreground",
                    activeTab === tab.id
                      ? "bg-background text-foreground border-b-2 border-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">
                    {tab.id === "available" ? "Horarios" : tab.id === "book" ? "Reservar" : "Mis Turnos"}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-2 sm:px-4 py-2 sm:py-8 max-w-full overflow-x-hidden pb-20">
        {renderContent()}
      </main>

      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <Link
          href="/login"
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <LogIn className="w-4 h-4" />
          Acceso Administrativo
        </Link>
      </div>
    </div>
  )
}
