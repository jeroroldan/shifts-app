"use client"


import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from "@/lib/supabase-client"
import bcrypt from "bcryptjs"

interface AuthState {
  isAuthenticated: boolean
  user: { email: string; name: string } | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}



export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: async (email: string, password: string) => {
        // Buscar usuario en Supabase
        const { data, error } = await supabase
          .from("users")
          .select("id, email, password_hash, name")
          .eq("email", email)
          .single();

        if (error || !data) {
          set({ isAuthenticated: false, user: null });
          return false;
        }

        // Validar password con bcrypt
        const isValid = await bcrypt.compare(password, data.password_hash);
        if (isValid) {
          set({
            isAuthenticated: true,
            user: { email: data.email, name: data.name || "" },
          });
          return true;
        } else {
          set({ isAuthenticated: false, user: null });
          return false;
        }
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
