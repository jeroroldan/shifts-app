"use client"

import { useState } from "react"

import OwnerDashboard from "@/components/owner/owner-dashboard"
import { Navigation } from "@/components/layout/navigation"
import ProtectedRoute from "@/components/auth/protected-route"
import { Header } from "@/components/layout/header"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="container mx-auto px-4 py-6">
          <OwnerDashboard />
        </main>
      </div>
    </ProtectedRoute>
  )
}
