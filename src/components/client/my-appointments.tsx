"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, Clock, User, Search, FileText } from "lucide-react"
import { appointmentStore } from "@/lib/appointment-store"

export function MyAppointments() {
  const [searchName, setSearchName] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = () => {
    if (!searchName.trim()) return

    const appointments = appointmentStore.getAll()
    const results = appointments.filter((apt) => apt.clientName.toLowerCase().includes(searchName.toLowerCase()))

    setSearchResults(results)
    setHasSearched(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pendiente</Badge>
      case "completed":
        return <Badge variant="default">Completado</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Mis Turnos</h2>
        <p className="text-muted-foreground">Consulte el estado de sus citas agendadas</p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar mis turnos
          </CardTitle>
          <CardDescription>Ingrese su nombre para ver sus citas agendadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search-name" className="sr-only">
                Nombre
              </Label>
              <Input
                id="search-name"
                type="text"
                placeholder="Ingrese su nombre completo"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={!searchName.trim()}>
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-4">
          {searchResults.length > 0 ? (
            <>
              <h3 className="text-lg font-semibold">
                {searchResults.length} turno{searchResults.length !== 1 ? "s" : ""} encontrado
                {searchResults.length !== 1 ? "s" : ""}
              </h3>
              {searchResults.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{appointment.clientName}</span>
                          {getStatusBadge(appointment.status)}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{appointment.reason}</span>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{appointment.createdAt.toLocaleDateString("es-ES")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{appointment.desiredTime}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                            <strong>Notas:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full">
                    <Search className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">No se encontraron turnos</h3>
                    <p className="text-sm text-muted-foreground">
                      No hay turnos registrados con el nombre "{searchName}"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {!hasSearched && (
        <Card className="bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-full">
                <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Consulte sus turnos</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Ingrese su nombre en el campo de búsqueda para ver sus citas agendadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
