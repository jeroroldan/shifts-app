"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Calendar, Users, CheckCircle, AlertCircle, XCircle, TrendingUp, Activity, Timer } from "lucide-react"
import { getAppointments } from "@/lib/appointments-supabase"

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getAppointments()
      .then((data) => {
        setAppointments(data)
        setError(null)
      })
      .catch(() => setError("Error al cargar turnos"))
      .finally(() => setLoading(false))
  }, [])

  // Calcular stats localmente
  const stats = useMemo(() => {
    const today = new Date()
    const todayStr = today.toDateString()
    let totalToday = 0, pending = 0, completed = 0
    let totalWaitTime = 0, waitCount = 0
    appointments.forEach((apt) => {
      const createdAt = apt.createdAt ? (typeof apt.createdAt === "string" ? new Date(apt.createdAt) : apt.createdAt) : null
      if (createdAt && typeof createdAt.toDateString === "function" && createdAt.toDateString() === todayStr) {
        totalToday++
        if (apt.status === "pending") pending++
        if (apt.status === "completed") completed++
      }
      // Calcular tiempo de espera promedio si hay datos
      if (apt.status === "completed" && apt.createdAt && apt.completedAt) {
        const start = typeof apt.createdAt === "string" ? new Date(apt.createdAt) : apt.createdAt
        const end = typeof apt.completedAt === "string" ? new Date(apt.completedAt) : apt.completedAt
        const diff = (end.getTime() - start.getTime()) / 60000 // minutos
        if (!isNaN(diff)) {
          totalWaitTime += diff
          waitCount++
        }
      }
    })
    const averageWaitTime = waitCount > 0 ? Math.round(totalWaitTime / waitCount) : 0
    return { totalToday, pending, completed, averageWaitTime }
  }, [appointments])

  // Calculate additional metrics
  const metrics = useMemo(() => {
    const today = new Date()
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const weeklyAppointments = appointments.filter((apt) => {
      const createdAt = typeof apt.createdAt === "string" ? new Date(apt.createdAt) : apt.createdAt
      return createdAt >= thisWeek
    })
    const monthlyAppointments = appointments.filter((apt) => {
      const createdAt = typeof apt.createdAt === "string" ? new Date(apt.createdAt) : apt.createdAt
      return createdAt >= thisMonth
    })

    // Status distribution
    const statusCounts = appointments.reduce(
      (acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Hourly distribution
    const hourlyData = Array.from({ length: 11 }, (_, i) => {
      const hour = i + 8 // 8 AM to 6 PM
      const count = appointments.filter((apt) => {
        if (!apt.desiredTime) return false
        const aptHour = Number.parseInt(apt.desiredTime.split(":")[0])
        return aptHour === hour
      }).length
      return {
        hour: `${hour}:00`,
        appointments: count,
      }
    })

    // Weekly trend (last 7 days)
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
      const count = appointments.filter((apt) => {
        const createdAt = apt.createdAt ? (typeof apt.createdAt === "string" ? new Date(apt.createdAt) : apt.createdAt) : null
        return createdAt && typeof createdAt.toDateString === "function" && createdAt.toDateString() === date.toDateString()
      }).length
      return {
        date: date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
        appointments: count,
      }
    })

    // Completion rate
    const completionRate = appointments.length > 0 ? ((statusCounts.completed || 0) / appointments.length) * 100 : 0

    return {
      total: appointments.length,
      weekly: weeklyAppointments.length,
      monthly: monthlyAppointments.length,
      statusCounts,
      hourlyData,
      weeklyTrend,
      completionRate,
    }
  }, [appointments])

  const statusColors = {
    pending: "#f59e0b",
    completed: "#10b981",
    cancelled: "#ef4444",
  }

  const pieData = Object.entries(metrics.statusCounts).map(([status, count]) => ({
    name: status === "pending" ? "Pendientes" : status === "completed" ? "Completados" : "Cancelados",
    value: count,
    color: statusColors[status as keyof typeof statusColors],
  }))

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando datos...</div>
  }
  if (error) {
    return <div className="p-8 text-center text-destructive">{error}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Panel Administrativo</h2>
        <p className="text-muted-foreground">Estadísticas y métricas del sistema de turnos</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnos Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending} pendientes, {stats.completed} completados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Turnos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">{metrics.weekly} esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageWaitTime}min</div>
            <p className="text-xs text-muted-foreground">Tiempo de espera promedio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <Progress value={metrics.completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{metrics.statusCounts.pending || 0}</div>
            <p className="text-sm text-muted-foreground">Turnos por atender</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics.statusCounts.completed || 0}</div>
            <p className="text-sm text-muted-foreground">Turnos finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metrics.statusCounts.cancelled || 0}</div>
            <p className="text-sm text-muted-foreground">Turnos cancelados</p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
