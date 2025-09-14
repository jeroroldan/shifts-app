import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase-client"
import bcrypt from "bcryptjs"

export async function fetchUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, password_hash, name")
    .eq("email", email)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export function useLoginMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const user = await fetchUserByEmail(email)
      if (!user) throw new Error("Usuario no encontrado")
      const isValid = await bcrypt.compare(password, user.password_hash)
      if (!isValid) throw new Error("Contraseña incorrecta")
      return { email: user.email, name: user.name || "" }
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["auth", "user"], user)
    },
  })
}

export function useAuthUser() {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => null, // Solo cache, no fetch
    staleTime: Infinity,
    gcTime: Infinity,
  })
}
