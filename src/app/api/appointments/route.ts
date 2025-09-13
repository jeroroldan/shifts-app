import { type NextRequest, NextResponse } from "next/server"
import { appointmentStore } from "@/lib/appointment-store"
import type { CreateAppointmentDTO, AppointmentQueryParams, ApiResponse, PaginatedResponse } from "@/types/api"
import type { Appointment } from "@/types/appointment"

// GET /api/appointments - Obtener lista de turnos con filtros y paginación
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params: AppointmentQueryParams = {
      status: (searchParams.get("status") as any) || "all",
      sortBy: (searchParams.get("sortBy") as any) || "created",
      sortOrder: (searchParams.get("sortOrder") as any) || "desc",
      search: searchParams.get("search") || "",
      page: Number.parseInt(searchParams.get("page") || "1"),
      limit: Number.parseInt(searchParams.get("limit") || "10"),
    }

    let appointments = appointmentStore.getAll()

    // Filtrar por estado
    if (params.status && params.status !== "all") {
      appointments = appointments.filter((apt) => apt.status === params.status)
    }

    // Filtrar por búsqueda
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      appointments = appointments.filter(
        (apt) =>
          apt.clientName.toLowerCase().includes(searchLower) ||
          apt.reason.toLowerCase().includes(searchLower) ||
          (apt.notes && apt.notes.toLowerCase().includes(searchLower)),
      )
    }

    // Ordenar
    appointments.sort((a, b) => {
      let comparison = 0

      switch (params.sortBy) {
        case "name":
          comparison = a.clientName.localeCompare(b.clientName)
          break
        case "time":
          comparison = new Date(a.desiredTime).getTime() - new Date(b.desiredTime).getTime()
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
        case "created":
        default:
          comparison = a.createdAt.getTime() - b.createdAt.getTime()
          break
      }

      return params.sortOrder === "desc" ? -comparison : comparison
    })

    // Paginación
    const total = appointments.length
    const totalPages = Math.ceil(total / (params.limit || 10))
    const startIndex = ((params.page || 1) - 1) * (params.limit || 10)
    const endIndex = startIndex + (params.limit || 10)
    const paginatedAppointments = appointments.slice(startIndex, endIndex)

    const response: ApiResponse<PaginatedResponse<Appointment>> = {
      success: true,
      data: {
        data: paginatedAppointments,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total,
          totalPages,
        },
      },
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

// POST /api/appointments - Crear nuevo turno
export async function POST(request: NextRequest) {
  try {
    const body: CreateAppointmentDTO = await request.json()

    // Validación básica
    if (!body.clientName || !body.reason || !body.desiredTime) {
      return NextResponse.json(
        {
          success: false,
          error: "Datos requeridos faltantes",
          message: "clientName, reason y desiredTime son obligatorios",
        },
        { status: 400 },
      )
    }

    // Validar formato de fecha
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

    const newAppointment = appointmentStore.create({
      clientName: body.clientName.trim(),
      reason: body.reason.trim(),
      desiredTime: body.desiredTime,
      status: "pending",
      notes: body.notes?.trim(),
    })

    const response: ApiResponse<Appointment> = {
      success: true,
      data: newAppointment,
      message: "Turno creado exitosamente",
    }

    return NextResponse.json(response, { status: 201 })
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
