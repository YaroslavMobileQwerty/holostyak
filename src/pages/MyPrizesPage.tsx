import { Navigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/hooks/useAuth'
import { useMyPrizes } from '@/hooks/useMyPrizes'
import { PrizeCard } from '@/components/prizes/PrizeCard'
import { Skeleton } from '@/components/ui/Skeleton'

export function MyPrizesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: prizes, isLoading } = useMyPrizes()

  if (authLoading) {
    return (
      <div className="py-10">
        <Skeleton className="h-40" />
      </div>
    )
  }
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/prizes' }} replace />

  return (
    <div className="mx-auto max-w-2xl py-10">
      <Helmet>
        <title>Мої призи — Холостяк</title>
      </Helmet>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl">Мої призи</h1>
          <p className="mt-2 text-rose-dust">Топ сезону, доставка та сюрпризи.</p>
        </div>
        <Link to="/profile" className="text-sm text-primary-live hover:underline">
          ← Профіль
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8">
          <Skeleton className="h-64" />
        </div>
      ) : !prizes?.length ? (
        <p className="mt-10 text-rose-dust">Ще немає призів. Грай у прогнозах і вигравай у сезоні!</p>
      ) : (
        <div className="mt-8 space-y-6">
          {prizes.map((p) => (
            <PrizeCard key={p.id} row={p} />
          ))}
        </div>
      )}
    </div>
  )
}
