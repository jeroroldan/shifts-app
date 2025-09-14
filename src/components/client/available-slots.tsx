"use client"

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Calendar, CheckCircle, ArrowRight } from "lucide-react"
import { useAppointmentStore } from "@/lib/appointment-store"
import type { AppointmentState } from "@/lib/appointment-store"
import type { Appointment } from "@/types/appointment"


interface AvailableSlotsProps {
}

export function AvailableSlots({}: AvailableSlotsProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const appointments = useAppointmentStore((state: AppointmentState) => {
    console.log('Appointment store state accessed:', state);
    return state.getAll()
  })

  const availableDates = useMemo(() => {
    const dates = []
    const today = new Date()

    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(today)
      currentDate.setDate(today.getDate() + day)

      if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue

      dates.push({
        date: currentDate,
        dateString: currentDate.toLocaleDateString("es-ES", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        shortDate: currentDate.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        isoDate: currentDate.toISOString().split("T")[0],
      })
    }

    return dates
  }, [])

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return []

    const slots = []

    for (let hour = 8; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

        const isBooked = appointments.some(
          (apt: Appointment) =>
            apt.desiredTime === timeString &&
            apt.createdAt.toDateString() === new Date(selectedDate).toDateString() &&
            apt.status !== "cancelled",
        )

        slots.push({
          time: timeString,
          available: !isBooked,
        })
      }
    }

    return slots
  }, [selectedDate, appointments])

  const handleTimeSelection = (time: string) => {
    setSelectedTime(time)
  }

  const handleConfirmBooking = () => {
    if (!selectedTime) return

    sessionStorage.setItem("selectedDate", selectedDate!)
    sessionStorage.setItem("selectedTime", selectedTime)

    const event = new CustomEvent("openBookingForm", {
      detail: { date: selectedDate, time: selectedTime },
    })
    window.dispatchEvent(event);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Reservar Turno</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Seleccione primero un día y luego un horario disponible
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            Paso 1: Seleccione un día
          </CardTitle>
          <CardDescription className="text-sm">Elija el día para su cita</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {availableDates.map((dateOption) => (
              <Button
                key={dateOption.isoDate}
                variant={selectedDate === dateOption.isoDate ? "default" : "outline"}
                className="h-12 sm:h-16 flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-xs sm:text-sm"
                onClick={() => {
                  setSelectedDate(dateOption.isoDate)
                  setSelectedTime(null)
                }}
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium leading-tight">{dateOption.shortDate}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              Paso 2: Seleccione un horario
            </CardTitle>
            <CardDescription className="text-sm">
              Horarios disponibles para {availableDates.find((d) => d.isoDate === selectedDate)?.dateString}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              <Select value={selectedTime || ""} onValueChange={handleTimeSelection}>
                <SelectTrigger className="w-full h-10 sm:h-11">
                  <SelectValue placeholder="Seleccione un horario disponible" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimeSlots
                    .filter((slot) => slot.available)
                    .map((slot) => (
                      <SelectItem key={slot.time} value={slot.time}>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {slot.time}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {selectedTime && (
                <Button onClick={handleConfirmBooking} className="w-full h-10 sm:h-11">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continuar con la reserva
                </Button>
              )}
            </div>

            {availableTimeSlots.some((slot) => !slot.available) && (
              <div className="pt-3 sm:pt-4 border-t">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">Horarios ocupados:</p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {availableTimeSlots
                    .filter((slot) => !slot.available)
                    .map((slot) => (
                      <Badge key={slot.time} variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {slot.time}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {availableTimeSlots.filter((slot) => slot.available).length === 0 && (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-sm sm:text-base">No hay horarios disponibles para este día</p>
                <p className="text-xs sm:text-sm">Por favor seleccione otro día</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-medium text-blue-900 dark:text-blue-100">¿Cómo funciona?</h3>
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1 leading-relaxed">
                1. Seleccione el día que prefiere para su cita
                <br />
                2. Elija un horario disponible de la lista
                <br />
                3. Complete el formulario de reserva con sus datos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
