
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase-client"

import type { Appointment } from '@/types/appointment'
import type { AppointmentStats } from '@/types/appointment'

export type AppointmentState = {
  appointments: Appointment[]
  addAppointment: (appointment: Omit<Appointment, "id" | "createdAt">) => void
  getAll: () => Appointment[]
  getById: (id: string) => Appointment | undefined
  create: (data: Omit<Appointment, 'id' | 'createdAt'>) => Appointment
  update: (id: string, updates: Partial<Appointment>) => Appointment | null
  delete: (id: string) => void
  getStats: () => AppointmentStats
  loadAppointments: () => Promise<void>
}

export const useAppointmentStore = create<AppointmentState>()(
  persist(
    (set, get) => ({
      appointments: [],
      loadAppointments: async () => {
        try {
          const { data, error } = await supabase
            .from("appointments")
            .select("*")
            .order("createdAt", { ascending: false })
          if (error) {
            console.error("Error loading appointments:", error)
            return
          }
          set({
            appointments: data?.map((apt: Appointment) => ({
              ...apt,
              createdAt: new Date(apt.createdAt),
            })) || [],
          })
        } catch (err) {
          console.error("Failed to load appointments:", err)
        }
      },
      getAll: () => get().appointments,
      getById: (id: string) => get().appointments.find(apt => apt.id === id),
      addAppointment: (newApt) => {
        const apt = {
          ...newApt,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          status: "pending" as const,
        }
        set((state) => ({ appointments: [...state.appointments, apt] }))
      },
      create: (data: Omit<Appointment, 'id' | 'createdAt'>) => {
        const newAppointment: Appointment = {
          id: crypto.randomUUID(),
          createdAt: new Date(),
          ...data
        }
        const { addAppointment } = get()
        addAppointment(newAppointment)
        return newAppointment
      },
      update: (id: string, updates: Partial<Appointment>) => {
        const { appointments } = get()
        const index = appointments.findIndex(apt => apt.id === id)
        if (index === -1) return null
        const updated = { ...appointments[index], ...updates }
        set((state) => ({
          appointments: state.appointments.map((apt, i) => i === index ? updated : apt)
        }))
        return updated
      },
      delete: (id: string) => {
        set((state) => ({
          appointments: state.appointments.filter(apt => apt.id !== id)
        }))
      },
      getStats: () => {
        const { appointments } = get()
        const total = appointments.length
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const totalToday = appointments.filter(apt => new Date(apt.createdAt) >= today).length
        const pending = appointments.filter(apt => apt.status === 'pending').length
        const completed = appointments.filter(apt => apt.status === 'completed').length
        const cancelled = appointments.filter(apt => apt.status === 'cancelled').length
        const averageWaitTime = total > 0 ? appointments.reduce((sum, apt) => {
          if (!apt.desiredTime) return sum
          const [hour, minute] = apt.desiredTime.split(':').map(Number)
          if (isNaN(hour) || isNaN(minute)) return sum
          const desiredDate = new Date(apt.createdAt)
          desiredDate.setHours(hour, minute, 0, 0)
          const waitMs = desiredDate.getTime() - apt.createdAt.getTime()
          return sum + Math.max(0, waitMs) // Ensure non-negative
        }, 0) / total / (1000 * 60) : 0 // minutes
        return {
          total,
          totalToday,
          completed,
          pending,
          cancelled,
          byStatus: { pending, completed, cancelled },
          averageWaitTime: Math.round(averageWaitTime)
        } as AppointmentStats
      }
    }),
    {
      name: "appointment-storage",
      partialize: (state) => ({ appointments: state.appointments }),
    }
  )
)

export const appointmentStore = useAppointmentStore