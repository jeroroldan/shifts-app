"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Clock, User, FileText, Trash2 } from "lucide-react"
import { appointmentStore } from "@/lib/appointment-store"
import { useToast } from "@/hooks/use-toast"
import type { Appointment } from "@/types/appointment"

interface EditAppointmentDialogProps {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditAppointmentDialog({ appointment, open, onOpenChange, onSuccess }: EditAppointmentDialogProps) {
  const [formData, setFormData] = useState({
    clientName: "",
    reason: "",
    desiredTime: "",
    status: "pending" as Appointment["status"],
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  // Update form data when appointment changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        clientName: appointment.clientName,
        reason: appointment.reason,
        desiredTime: appointment.desiredTime,
        status: appointment.status,
        notes: appointment.notes || "",
      })
    }
  }, [appointment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appointment) return

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

      // Update appointment
      const updates: Partial<Appointment> = {
        clientName: formData.clientName.trim(),
        reason: formData.reason.trim(),
        desiredTime: formData.desiredTime,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      }

      // Add completion timestamp if status changed to completed
      if (formData.status === "completed" && appointment.status !== "completed") {
        updates.completedAt = new Date()
      }

      const updatedAppointment = appointmentStore.update(appointment.id, updates)

      if (updatedAppointment) {
        toast({
          title: "Turno actualizado exitosamente",
          description: `Los datos de ${updatedAppointment.clientName} han sido actualizados.`,
        })

        onOpenChange(false)
        onSuccess?.()
      } else {
        throw new Error("No se pudo actualizar el turno")
      }
    } catch (error) {
      toast({
        title: "Error al actualizar turno",
        description: "Ocurrió un error inesperado. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!appointment) return

    try {
      const success = appointmentStore.delete(appointment.id)

      if (success) {
        toast({
          title: "Turno eliminado",
          description: `El turno de ${appointment.clientName} ha sido eliminado.`,
        })

        setShowDeleteDialog(false)
        onOpenChange(false)
        onSuccess?.()
      } else {
        throw new Error("No se pudo eliminar el turno")
      }
    } catch (error) {
      toast({
        title: "Error al eliminar turno",
        description: "Ocurrió un error inesperado. Intente nuevamente.",
        variant: "destructive",
      })
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

  if (!appointment) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] max-w-[95vw] max-h-[85vh] overflow-y-auto p-4">
          <DialogHeader className="pb-2">
            <DialogTitle>Editar Turno</DialogTitle>
            <DialogDescription>Modifique los datos del turno o cambie su estado.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Client Name */}
            <div className="space-y-1">
              <Label htmlFor="edit-clientName" className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                Nombre del Cliente *
              </Label>
              <Input
                id="edit-clientName"
                type="text"
                placeholder="Ingrese el nombre completo"
                value={formData.clientName}
                onChange={(e) => handleInputChange("clientName", e.target.value)}
                required
                className="h-9"
              />
            </div>

            {/* Reason */}
            <div className="space-y-1">
              <Label htmlFor="edit-reason" className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                Motivo de la Consulta *
              </Label>
              <Input
                id="edit-reason"
                type="text"
                placeholder="Ej: Consulta general, revisión, etc."
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                required
                className="h-9"
              />
            </div>

            {/* Desired Time */}
            <div className="space-y-1">
              <Label htmlFor="edit-desiredTime" className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4" />
                Hora Deseada *
              </Label>
              <Select value={formData.desiredTime} onValueChange={(value) => handleInputChange("desiredTime", value)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Seleccione una hora" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <Label htmlFor="edit-status" className="text-sm font-medium">
                Estado del Turno *
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: Appointment["status"]) => handleInputChange("status", value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor="edit-notes" className="text-sm font-medium">
                Notas Adicionales
              </Label>
              <Textarea
                id="edit-notes"
                placeholder="Información adicional sobre la cita..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={2}
                className="min-h-[60px] resize-none"
              />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-3">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 h-9"
                size="sm"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9" size="sm">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-9" size="sm">
                  {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El turno de <strong>{appointment.clientName}</strong> será eliminado
              permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Turno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
