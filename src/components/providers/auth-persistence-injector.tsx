'use client'

import { useAuthPersistence } from "@/lib/use-auth-persistence"

export function AuthPersistenceInjector() {
  useAuthPersistence()
  return null
}
