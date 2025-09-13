"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, User, FileText, Search, Filter, Calendar, CheckCircle, XCircle, AlertCircle, Edit } from "lucide-react"
import { appointmentStore } from "@/lib/appointment-store"
import { EditAppointmentDialog } from "./edit-appointment-dialog"
import type { Appointment, SortOption, FilterOption } from "@/types/appointment"
import { cn } from "@/lib/utils"

export function AppointmentList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("time")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const appointments = appointmentStore.getAll()

  const filteredAndSortedAppointments = useMemo(() => {
    let filtered = appointments

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (apt) =>
          apt.clientName.toLowerCase().includes(search) ||
          apt.reason.toLowerCase().includes(search) ||
          apt.notes?.toLowerCase().includes(search),
      )
    }

    // Apply status filter
    if (filterBy !== "all") {
      filtered = filtered.filter((apt) => apt.status === filterBy)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "time":
          return a.desiredTime.localeCompare(b.desiredTime)
        case "name":
          return a.clientName.localeCompare(b.clientName)
        case "status":
          return a.status.localeCompare(b.status)
        case "created":
          return b.createdAt.getTime() - a.createdAt.getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [appointments, searchTerm, sortBy, filterBy, refreshKey])

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const getStatusIcon = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

  const getStatusLabel = (status: Appointment["status"]) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "completed":
        return "Completado"
      case "cancelled":
        return "Cancelado"
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Lista de Turnos</h2>
          <p className="text-muted-foreground">
            {filteredAndSortedAppointments.length} de {appointments.length} turnos
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filter by Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort by */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ordenar por</label>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Hora deseada</SelectItem>
                  <SelectItem value="name">Nombre del cliente</SelectItem>
                  <SelectItem value="status">Estado</SelectItem>
                  <SelectItem value="created">Fecha de creación</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAndSortedAppointments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No se encontraron turnos</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterBy !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay turnos registrados aún"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Header with name and status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{appointment.clientName}</h3>
                          <p className="text-sm text-muted-foreground">
                            Creado el {formatDate(appointment.createdAt)} a las {formatTime(appointment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Badge className={cn("flex items-center gap-1", getStatusColor(appointment.status))}>
                        {getStatusIcon(appointment.status)}
                        {getStatusLabel(appointment.status)}
                      </Badge>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-13">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Hora deseada:</span>
                        <span>{appointment.desiredTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Motivo:</span>
                        <span>{appointment.reason}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {appointment.notes && (
                      <div className="pl-13">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Notas:</span> {appointment.notes}
                        </p>
                      </div>
                    )}

                    {/* Completed info */}
                    {appointment.status === "completed" && appointment.completedAt && (
                      <div className="pl-13">
                        <p className="text-sm text-green-600">
                          Completado el {formatDate(appointment.completedAt)} a las{" "}
                          {formatTime(appointment.completedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(appointment)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <EditAppointmentDialog
        appointment={editingAppointment}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </div>
  )
}
