"use client"

import { useMutation, useQuery } from '@tanstack/react-query'
import { supabase } from './supabase-client'
import type { User } from '@supabase/supabase-js'

export function useAuthUser() {
  return useQuery<User | null>({
    queryKey: ['auth-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    },
  })
}