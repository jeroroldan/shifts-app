import { useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { useAuthStore, fetchUserProfile } from "@/lib/auth-store"

export function useAuthPersistence() {
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated)
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    // Hidratar estado inicial desde Supabase session
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id)
        setAuthenticated(true)
        setUser({
          email: session.user.email || "",
          name: profile?.name || ""
        })
      } else {
        setAuthenticated(false)
        setUser(null)
      }
    }

    initAuth()

    // Listener para cambios de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id)
          setAuthenticated(true)
          setUser({
            email: session.user.email || "",
            name: profile?.name || ""
          })
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false)
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setAuthenticated, setUser])
}
