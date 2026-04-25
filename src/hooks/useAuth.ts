import { useEffect, useMemo } from 'react'
import { isDemoMode } from '@/lib/demoMode'
import { getDevMockAuthSession } from '@/lib/devMockAuth'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'

export function useAuthInit() {
  const setSession = useAuthStore((s) => s.setSession)
  useEffect(() => {
    if (isDemoMode()) return
    void supabase.auth.getSession().then(({ data }) => setSession(data.session))
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
  const devMock = useMemo(() => getDevMockAuthSession(), [])
  const effectiveSession = session ?? devMock
  const effectiveUser = user ?? devMock?.user ?? null
  const showMockAuthUi = !session && !!devMock
  const effectiveLoading = showMockAuthUi ? false : isLoading

  /** `true` when UI uses `VITE_DEV_MOCK_USER_ID` without a real Supabase session (no JWT in client). */
  const isDevAuthMock = !session && !!devMock

  return {
    session: effectiveSession,
    user: effectiveUser,
    isLoading: effectiveLoading,
    isAuthenticated: !!effectiveSession,
    isDevAuthMock,
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
