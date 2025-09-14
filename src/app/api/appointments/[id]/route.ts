import { type NextRequest, NextResponse } from "next/server"
import { getAppointmentById, updateAppointment, deleteAppointment } from "@/lib/appointments-supabase"
import type { UpdateAppointmentDTO, ApiResponse } from "@/types/api"
import type { Appointment } from "@/types/appointment"

// GET /api/appointments/[id] - Obtener turno específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const appointment = await getAppointmentById(params.id)

    if (!appointment) {
      return NextResponse.json(
        {
          success: false,
          error: "Turno no encontrado",
          message: `No se encontró el turno con ID: ${params.id}`,
        },
        { status: 404 },
      )
    }

    const response: ApiResponse<Appointment> = {
      success: true,
      data: appointment,
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

// PUT /api/appointments/[id] - Actualizar turno
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body: UpdateAppointmentDTO = await request.json()

    // Verificar que el turno existe
    const existingAppointment = await getAppointmentById(params.id)
    if (!existingAppointment) {
      return NextResponse.json(
        {
          success: false,
          error: "Turno no encontrado",
          message: `No se encontró el turno con ID: ${params.id}`,
        },
        { status: 404 },
      )
    }

    // Validar tiempo si se proporciona (HH:MM format)
    if (body.desiredTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(body.desiredTime)) {
        return NextResponse.json(
          {
            success: false,
            error: "Formato de tiempo inválido",
            message: "desiredTime debe ser en formato HH:MM (ej. 14:30)",
          },
          { status: 400 },
        )
      }
    }

    // Preparar datos de actualización
    const updateData: Partial<Appointment> = {}
    if (body.clientName) updateData.clientName = body.clientName.trim()
    if (body.reason) updateData.reason = body.reason.trim()
    if (body.desiredTime) updateData.desiredTime = body.desiredTime
    if (body.status) updateData.status = body.status
    if (body.notes !== undefined) updateData.notes = body.notes?.trim()

    const updatedAppointment = await updateAppointment(params.id, updateData)

    if (!updatedAppointment) {
      return NextResponse.json(
        {
          success: false,
          error: "Error al actualizar turno",
          message: "No se pudo actualizar el turno",
        },
        { status: 500 },
      )
    }

    const response: ApiResponse<Appointment> = {
      success: true,
      data: updatedAppointment,
      message: "Turno actualizado exitosamente",
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

// DELETE /api/appointments/[id] - Eliminar turno
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existingAppointment = await getAppointmentById(params.id)
    if (!existingAppointment) {
      return NextResponse.json(
        {
          success: false,
          error: "Turno no encontrado",
          message: `No se encontró el turno con ID: ${params.id}`,
        },
        { status: 404 },
      )
    }

    const success = await deleteAppointment(params.id)

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Error al eliminar turno",
          message: "No se pudo eliminar el turno",
        },
        { status: 500 },
      )
    }

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: "Turno eliminado exitosamente",
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
