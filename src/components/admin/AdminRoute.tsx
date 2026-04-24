import { useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { Skeleton } from '@/components/ui/Skeleton'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()
  const location = useLocation()
  const toastShown = useRef(false)

  const ready = !authLoading && !profileLoading
  const denied = ready && isAuthenticated && profile?.role !== 'admin'

  useEffect(() => {
    if (denied && !toastShown.current) {
      toastShown.current = true
      toast.error('Немає доступу')
    }
  }, [denied])

  if (authLoading || profileLoading) {
    return (
      <div className="p-8">
        <Skeleton className="h-40" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
