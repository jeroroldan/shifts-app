"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Navigation } from "@/components/layout/navigation"
import { AppointmentList } from "@/components/appointments/appointment-list"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("admin")
  const [refreshKey, setRefreshKey] = useState(0)

  const renderContent = () => {
    switch (activeTab) {
      case "list":
        return <AppointmentList key={refreshKey} />
      case "admin":
        return <AdminDashboard key={refreshKey} />
      default:
        return <AdminDashboard key={refreshKey} />
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="container mx-auto px-4 py-8">{renderContent()}</main>
      </div>
    </ProtectedRoute>
  )
}
