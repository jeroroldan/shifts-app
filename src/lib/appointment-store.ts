import type { Appointment, AppointmentStats } from "@/types/appointment"

// Simulación temporal de datos en memoria
const appointments: Appointment[] = [];

export const appointmentStore = {
  getAll: (): Appointment[] => appointments,

  getById: (id: string): Appointment | undefined => appointments.find((apt) => apt.id === id),

  create: (appointment: Omit<Appointment, "id" | "createdAt">): Appointment => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    appointments.push(newAppointment)
    return newAppointment
  },

  update: (id: string, updates: Partial<Appointment>): Appointment | null => {
    const index = appointments.findIndex((apt) => apt.id === id)
    if (index === -1) return null

    appointments[index] = { ...appointments[index], ...updates }
    return appointments[index]
  },

  delete: (id: string): boolean => {
    const index = appointments.findIndex((apt) => apt.id === id)
    if (index === -1) return false

    appointments.splice(index, 1)
    return true
  },

  getStats: (): AppointmentStats => {
    const today = new Date()
    const todayAppointments = appointments.filter((apt) => apt.createdAt.toDateString() === today.toDateString())

    const completed = todayAppointments.filter((apt) => apt.status === "completed")
    const pending = todayAppointments.filter((apt) => apt.status === "pending")

    // Calculate average wait time (mock calculation)
    const averageWaitTime =
      completed.length > 0
        ? completed.reduce((acc, apt) => {
            if (apt.completedAt) {
              const waitTime = apt.completedAt.getTime() - apt.createdAt.getTime()
              return acc + waitTime / (1000 * 60) // Convert to minutes
            }
            return acc
          }, 0) / completed.length
        : 0

    return {
      totalToday: todayAppointments.length,
      completed: completed.length,
      pending: pending.length,
      averageWaitTime: Math.round(averageWaitTime),
    }
  },
}
