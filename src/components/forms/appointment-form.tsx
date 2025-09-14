"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, User, FileText, Calendar } from "lucide-react"
import { createAppointment } from "@/lib/appointments-supabase"
import { useToast } from "@/hooks/use-toast"

interface AppointmentFormProps {
  onSuccess?: () => void
}

export function AppointmentForm({ onSuccess }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    reason: "",
    desiredTime: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form
      if (!formData.clientName.trim() || !formData.reason.trim() || !formData.desiredTime) {
        toast({
          title: "Error de validación",
          description: "Por favor complete todos los campos obligatorios.",
          variant: "destructive",
        })
        return
      }

      // Create appointment
      await createAppointment({
        clientName: formData.clientName.trim(),
        reason: formData.reason.trim(),
        desiredTime: formData.desiredTime,
        status: "pending",
        notes: formData.notes.trim() || undefined,
      })

      // Reset form
      setFormData({
        clientName: "",
        reason: "",
        desiredTime: "",
        notes: "",
      })

      toast({
        title: "Turno reservado exitosamente",
        description: `Turno reservado para ${formData.clientName} a las ${formData.desiredTime}`,
      })

      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error al registrar turno",
        description: "Ocurrió un error inesperado. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Generate time options (8:00 AM to 6:00 PM, every 30 minutes)
  const timeOptions = []
  for (let hour = 8; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
      timeOptions.push(timeString)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Registrar Nuevo Turno</CardTitle>
        <CardDescription>Complete los datos del cliente para agendar una cita</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Name */}
          <div className="space-y-2">
            <Label htmlFor="clientName" className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4" />
              Nombre del Cliente *
            </Label>
            <Input
              id="clientName"
              type="text"
              placeholder="Ingrese el nombre completo"
              value={formData.clientName}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4" />
              Motivo de la Consulta *
            </Label>
            <Input
              id="reason"
              type="text"
              placeholder="Ej: Consulta general, revisión, etc."
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              className="w-full"
              required
            />
          </div>

          {/* Desired Time */}
          <div className="space-y-2">
            <Label htmlFor="desiredTime" className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4" />
              Hora Deseada *
            </Label>
            <select
              id="desiredTime"
              value={formData.desiredTime}
              onChange={(e) => handleInputChange("desiredTime", e.target.value)}
              className="w-full px-3 py-2 bg-input border border-gray-200 dark:border-gray-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              required
            >
              <option value="">Seleccione una hora</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notas Adicionales (Opcional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Información adicional sobre la cita..."
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Turno"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
