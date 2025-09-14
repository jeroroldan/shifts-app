"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase-client"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  isAuthenticated: boolean
  user: { email: string; name: string } | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  setAuthenticated: (isAuth: boolean) => void
  setUser: (user: { email: string; name: string } | null) => void
}

// Fetch user profile from public.users
async function fetchUserProfile(userId: string): Promise<{ name: string } | null> {
  const { data, error } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single()

  if (error || !data) return null
  return { name: data.name || "" }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      setAuthenticated: (isAuth) => set({ isAuthenticated: isAuth }),

      setUser: (user) => set({ user }),

      login: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          set({ isAuthenticated: false, user: null })
          return false
        }

        if (data.user) {
          const profile = await fetchUserProfile(data.user.id)
          set({
            isAuthenticated: true,
            user: { 
              email: data.user.email || email, 
              name: profile?.name || "" 
            },
          })
          return true
        }

        return false
      },

      logout: async () => {
        const { error } = await supabase.auth.signOut()
        if (!error) {
          set({ isAuthenticated: false, user: null })
        }
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

export { fetchUserProfile }
