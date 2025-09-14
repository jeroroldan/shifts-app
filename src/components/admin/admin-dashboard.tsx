"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, CheckCircle, AlertCircle, XCircle, TrendingUp, Timer } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { Appointment, AppointmentStats } from "@/types/appointment"

export default function AdminDashboard() {
  const appointmentsQuery = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await apiClient.getAppointments({ page: 1, limit: 100 })
      if (!response.success) throw new Error(response.message || 'Error fetching appointments')
      return response.data?.data ?? []
    },
    staleTime: 5 * 60 * 1000,
  })

  const statsQuery = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await apiClient.getStats()
      if (!response.success) throw new Error(response.message || 'Error fetching stats')
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })

  const appointments = appointmentsQuery.data ?? []
  const stats = statsQuery.data


  // Calculate additional metrics
  const metrics = useMemo(() => {
    if (!appointments.length) return {
      total: 0,
      weekly: 0,
      monthly: 0,
      statusCounts: {} as Record<string, number>,
      hourlyData: [],
      weeklyTrend: [],
      completionRate: 0,
    }

    const today = new Date()
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    const parseDate = (dateValue: Date | string): Date => {
      if (dateValue instanceof Date) return dateValue
      return new Date(dateValue)
    }

    const weeklyAppointments = appointments.filter((apt) => {
      const createdAt = parseDate(apt.createdAt)
      return !isNaN(createdAt.getTime()) && createdAt >= thisWeek
    })
    const monthlyAppointments = appointments.filter((apt) => {
      const createdAt = parseDate(apt.createdAt)
      return !isNaN(createdAt.getTime()) && createdAt >= thisMonth
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
        const timeParts = apt.desiredTime.split(":")
        const aptHour = Number.parseInt(timeParts[0])
        return !isNaN(aptHour) && aptHour === hour
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
        const createdAt = parseDate(apt.createdAt)
        return !isNaN(createdAt.getTime()) && createdAt.toDateString() === date.toDateString()
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
    color: statusColors[status as keyof typeof statusColors] || "#6b7280",
  }))

  if (appointmentsQuery.isLoading || statsQuery.isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando datos...</div>
  }

  if (appointmentsQuery.error || statsQuery.error) {
    return (
      <div className="p-8 text-center text-destructive">
        Error cargando datos: {(appointmentsQuery.error || statsQuery.error)?.message || 'Error desconocido'}
      </div>
    )
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
            <div className="text-2xl font-bold">{stats?.totalToday ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pending ?? 0} pendientes, {stats?.completed ?? 0} completados
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
            <div className="text-2xl font-bold">{Math.round(stats?.averageWaitTime ?? 0)}min</div>
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
