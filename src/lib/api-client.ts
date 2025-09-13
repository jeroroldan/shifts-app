import type {
  ApiResponse,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  AppointmentQueryParams,
  AppointmentsResponse,
  AppointmentResponse,
  StatsResponse,
} from "@/types/api"

const API_BASE_URL = "/api"

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // Appointments CRUD
  async getAppointments(params?: AppointmentQueryParams): Promise<AppointmentsResponse> {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
    }

    const queryString = searchParams.toString()
    const endpoint = `/appointments${queryString ? `?${queryString}` : ""}`

    return this.request<any>(endpoint)
  }

  async getAppointment(id: string): Promise<AppointmentResponse> {
    return this.request<any>(`/appointments/${id}`)
  }

  async createAppointment(data: CreateAppointmentDTO): Promise<AppointmentResponse> {
    return this.request<any>("/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateAppointment(id: string, data: UpdateAppointmentDTO): Promise<AppointmentResponse> {
    return this.request<any>(`/appointments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteAppointment(id: string): Promise<ApiResponse<null>> {
    return this.request<null>(`/appointments/${id}`, {
      method: "DELETE",
    })
  }

  // Stats
  async getStats(): Promise<StatsResponse> {
    return this.request<any>("/appointments/stats")
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request<any>("/health")
  }
}

export const apiClient = new ApiClient()
