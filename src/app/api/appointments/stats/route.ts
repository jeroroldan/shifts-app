import { type NextRequest, NextResponse } from "next/server"
import { appointmentStore } from "@/lib/appointment-store"
import type { ApiResponse } from "@/types/api"
import type { AppointmentStats } from "@/types/appointment"

// GET /api/appointments/stats - Obtener estadísticas de turnos
export async function GET(request: NextRequest) {
  try {
    const stats = appointmentStore.getStats()

    const response: ApiResponse<AppointmentStats> = {
      success: true,
      data: stats,
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}
