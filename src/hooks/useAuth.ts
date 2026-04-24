import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'

export function useAuthInit() {
  const setSession = useAuthStore((s) => s.setSession)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => sub.subscription.unsubscribe()
  }, [setSession])
}

export function useAuth() {
  const session = useAuthStore((s) => s.session)
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)

  return {
    session,
    user,
    isLoading,
    isAuthenticated: !!session,
    signInWithGoogle: async (redirectTo?: string) => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo ?? `${window.location.origin}/auth/callback`,
        },
      })
    },
    signOut: () => supabase.auth.signOut(),
  }
}
