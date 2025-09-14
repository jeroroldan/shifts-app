import { supabase } from "@/lib/supabase-client"
import type { Appointment } from "@/types/appointment"

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
