"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Clock,
  Eye,
  Edit,
} from "lucide-react"
import { appointmentStore } from "@/lib/appointment-store"

export function OwnerDashboard() {
  const appointments = appointmentStore.getAll()

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const today = new Date()
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)

    const todayAppointments = appointments.filter((apt) => apt.createdAt.toDateString() === today.toDateString())
    const weeklyAppointments = appointments.filter((apt) => apt.createdAt >= thisWeek)
    const monthlyAppointments = appointments.filter((apt) => apt.createdAt >= thisMonth)
    const lastMonthAppointments = appointments.filter((apt) => apt.createdAt >= lastMonth && apt.createdAt < thisMonth)

    // Status distribution
    const statusCounts = appointments.reduce(
      (acc, apt) => {
        acc[apt.status] = (acc[apt.status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Monthly comparison
    const monthlyGrowth =
      lastMonthAppointments.length > 0
        ? ((monthlyAppointments.length - lastMonthAppointments.length) / lastMonthAppointments.length) * 100
        : 0

    // Daily trend for the last 30 days
    const dailyTrend = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(today.getTime() - (29 - i) * 24 * 60 * 60 * 1000)
      const count = appointments.filter((apt) => apt.createdAt.toDateString() === date.toDateString()).length
      return {
        date: date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
        appointments: count,
      }
    })

    // Hourly distribution
    const hourlyData = Array.from({ length: 11 }, (_, i) => {
      const hour = i + 8
      const count = appointments.filter((apt) => {
        const aptHour = Number.parseInt(apt.desiredTime.split(":")[0])
        return aptHour === hour
      }).length
      return {
        hour: `${hour}:00`,
        appointments: count,
      }
    })

    // Revenue estimation (assuming average service cost)
    const avgServiceCost = 25 // Example: $25 per service
    const monthlyRevenue = (statusCounts.completed || 0) * avgServiceCost
    const projectedMonthlyRevenue = monthlyRevenue * (30 / today.getDate())

    return {
      today: todayAppointments.length,
      weekly: weeklyAppointments.length,
      monthly: monthlyAppointments.length,
      monthlyGrowth,
      statusCounts,
      dailyTrend,
      hourlyData,
      monthlyRevenue,
      projectedMonthlyRevenue,
      completionRate: appointments.length > 0 ? ((statusCounts.completed || 0) / appointments.length) * 100 : 0,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard General</h1>
          <p className="text-muted-foreground">Vista completa de tu negocio de turnos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Ver Reportes
          </Button>
          <Button size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Turnos Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.today}</div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.monthly}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.monthlyGrowth > 0 ? "+" : ""}
              {metrics.monthlyGrowth.toFixed(1)}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Estimados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground">Proyección: ${metrics.projectedMonthlyRevenue.toFixed(0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Completado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.statusCounts.completed || 0} de {appointments.length} turnos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{metrics.statusCounts.pending || 0}</div>
            <p className="text-sm text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics.statusCounts.completed || 0}</div>
            <p className="text-sm text-muted-foreground">Servicios finalizados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Cancelados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{metrics.statusCounts.cancelled || 0}</div>
            <p className="text-sm text-muted-foreground">Turnos no realizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Diaria (30 días)</CardTitle>
            <CardDescription>Evolución de turnos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="appointments"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Estados</CardTitle>
            <CardDescription>Proporción de turnos por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Horario</CardTitle>
          <CardDescription>Preferencias de horarios de tus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.hourlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* All Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Todos los Turnos Registrados
          </CardTitle>
          <CardDescription>Historial completo de turnos agendados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {appointments
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{appointment.clientName}</p>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        Registrado: {appointment.createdAt.toLocaleDateString("es-ES")}{" "}
                        {appointment.createdAt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium">{appointment.desiredTime}</p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.desiredTime
                          ? new Date(appointment.desiredTime).toLocaleDateString("es-ES")
                          : "Sin fecha"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        appointment.status === "completed"
                          ? "default"
                          : appointment.status === "pending"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {appointment.status === "pending"
                        ? "Pendiente"
                        : appointment.status === "completed"
                          ? "Completado"
                          : "Cancelado"}
                    </Badge>
                  </div>
                </div>
              ))}
            {appointments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay turnos registrados aún</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
