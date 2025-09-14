import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

const AUTH_KEY = ["auth", "user"]

export function useAuthPersistence() {
  const queryClient = useQueryClient()

  // Guardar usuario en localStorage cuando cambia
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.toString() === AUTH_KEY.toString()) {
        const user = event.query.state.data
        if (user) {
          window.localStorage.setItem("auth-user", JSON.stringify(user))
        } else {
          window.localStorage.removeItem("auth-user")
        }
      }
    })
    return () => unsubscribe()
  }, [queryClient])

  // Hidratar usuario desde localStorage al cargar
  useEffect(() => {
    const userStr = window.localStorage.getItem("auth-user")
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        queryClient.setQueryData(AUTH_KEY, user)
      } catch {}
    }
  }, [queryClient])
}
