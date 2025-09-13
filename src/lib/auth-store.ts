"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthState {
  isAuthenticated: boolean
  user: { email: string; name: string } | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

// Credenciales de prueba para el dueño
const OWNER_CREDENTIALS = {
  email: "dueno@turnos.com",
  password: "admin123",
  name: "Dueño del Local",
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: async (email: string, password: string) => {
        // Simular delay de autenticación
        await new Promise((resolve) => setTimeout(resolve, 1000))

        if (email === OWNER_CREDENTIALS.email && password === OWNER_CREDENTIALS.password) {
          set({
            isAuthenticated: true,
            user: { email: OWNER_CREDENTIALS.email, name: OWNER_CREDENTIALS.name },
          })
          return true
        }

        // Si no es admin, nunca guardar autenticación
        set({ isAuthenticated: false, user: null })
        return false
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
        })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    },
  ),
)
