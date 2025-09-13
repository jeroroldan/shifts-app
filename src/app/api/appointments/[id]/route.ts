import { type NextRequest, NextResponse } from "next/server"
import { appointmentStore } from "@/lib/appointment-store"
import type { UpdateAppointmentDTO, ApiResponse } from "@/types/api"
import type { Appointment } from "@/types/appointment"

// GET /api/appointments/[id] - Obtener turno específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const appointment = appointmentStore.getById(params.id)

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
    const existingAppointment = appointmentStore.getById(params.id)
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

    // Validar fecha si se proporciona
    if (body.desiredTime) {
      const desiredDate = new Date(body.desiredTime)
      if (isNaN(desiredDate.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: "Formato de fecha inválido",
            message: "desiredTime debe ser una fecha válida",
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

    const updatedAppointment = appointmentStore.update(params.id, updateData)

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
    const existingAppointment = appointmentStore.getById(params.id)
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

    appointmentStore.delete(params.id)

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
