import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export function LoginPage() {
  const { signInWithGoogle, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, from, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-primary/20 bg-bg-card p-8 text-center">
        <h1 className="mb-2 font-serif text-3xl">Увійти</h1>
        <p className="mb-6 text-rose-dust">Щоб робити ставки й поповнювати бали</p>
        <button
          type="button"
          onClick={() =>
            signInWithGoogle(
              `${window.location.origin}/auth/callback?from=${encodeURIComponent(from)}`,
            )
          }
          className="w-full rounded-lg bg-white px-4 py-3 font-medium text-gray-900 transition hover:bg-gray-100"
        >
          Увійти через Google
        </button>
      </div>
    </div>
  )
}
