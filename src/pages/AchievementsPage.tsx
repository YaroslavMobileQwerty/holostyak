import { Navigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'
import { useMyAchievements } from '@/hooks/useMyAchievements'
import { AchievementsGrid } from '@/components/social/AchievementsGrid'
import { Skeleton } from '@/components/ui/Skeleton'

export function AchievementsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: items, isLoading } = useMyAchievements()

  if (authLoading) {
    return (
      <div className="py-10">
        <Skeleton className="h-40" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/achievements' }} replace />

  return (
    <div className="mx-auto max-w-4xl py-10">
      <Helmet>
        <title>Досягнення — Холостяк</title>
      </Helmet>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Досягнення</h1>
          <p className="mt-2 text-rose-dust">Збирай бейджі за активність і влучні прогнози.</p>
        </div>
        <Link to="/profile" className="text-sm text-primary-live hover:underline">
          ← Профіль
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8">
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="mt-8">
          <AchievementsGrid items={items ?? []} />
        </div>
      )}
    </div>
  )
}
