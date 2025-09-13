import type { Appointment, AppointmentStats } from "./appointment"

// DTOs para requests
export interface CreateAppointmentDTO {
  clientName: string
  reason: string
  desiredTime: string
  notes?: string
}

export interface UpdateAppointmentDTO {
  clientName?: string
  reason?: string
  desiredTime?: string
  status?: "pending" | "completed" | "cancelled"
  notes?: string
}

export interface AppointmentQueryParams {
  status?: "all" | "pending" | "completed" | "cancelled"
  sortBy?: "time" | "name" | "status" | "created"
  sortOrder?: "asc" | "desc"
  search?: string
  page?: number
  limit?: number
}

// DTOs para responses
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AppointmentResponse extends ApiResponse<Appointment> {}
export interface AppointmentsResponse extends ApiResponse<PaginatedResponse<Appointment>> {}
export interface StatsResponse extends ApiResponse<AppointmentStats> {}

// Tipos para validación
export interface ValidationError {
  field: string
  message: string
}

export interface ApiError {
  code: string
  message: string
  details?: ValidationError[]
}
