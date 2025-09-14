import { supabase } from "@/lib/supabase-client"
import type { Appointment, AppointmentStats } from "@/types/appointment"

export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("desiredTime", { ascending: true })
  if (error) throw error
  return data as Appointment[]
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", id)
    .single()
  if (error) return null
  return data as Appointment
}

export async function createAppointment(appointment: Omit<Appointment, "id" | "createdAt">): Promise<Appointment> {
  const { data, error } = await supabase
    .from("appointments")
    .insert([{ ...appointment }])
    .select()
    .single()
  if (error) throw error
  return data as Appointment
}

export async function updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", id)
    .select()
    .single()
  if (error) return null
  return data as Appointment
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", id)
  return !error
}

export async function getStats(): Promise<AppointmentStats> {
  const appointments = await getAppointments()
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
  }
}
