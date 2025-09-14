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
  total: number
  totalToday: number
  completed: number
  pending: number
  cancelled: number
  byStatus: {
    pending: number
    completed: number
    cancelled: number
  }
  averageWaitTime: number
}

export type SortOption = "time" | "name" | "status" | "created"
export type FilterOption = "all" | "pending" | "completed" | "cancelled"
