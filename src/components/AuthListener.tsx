// src/components/AuthListener.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function AuthListener() {
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Trigger a page refresh on any auth state change.
      // This ensures the server-side session is updated.
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  return null
}