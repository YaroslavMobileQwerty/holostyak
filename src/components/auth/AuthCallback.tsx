import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AuthCallback() {
  const { isLoading, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const from = params.get('from') ?? '/'

  useEffect(() => {
    if (!isLoading) {
      navigate(isAuthenticated ? from : '/login', { replace: true })
    }
  }, [isLoading, isAuthenticated, from, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-rose-dust">Завершуємо вхід…</p>
    </div>
  )
}
