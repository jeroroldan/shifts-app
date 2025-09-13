export interface Appointment {
  id: string
  clientName: string
  reason: string
  desiredTime: string
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
  completedAt?: Date
  notes?: string
}

export interface AppointmentStats {
  totalToday: number
  completed: number
  pending: number
  averageWaitTime: number
}

export type SortOption = "time" | "name" | "status" | "created"
export type FilterOption = "all" | "pending" | "completed" | "cancelled"
