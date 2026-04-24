import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { Skeleton } from '@/components/ui/Skeleton'

export function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading, signOut } = useAuth()
  const { data: profile, isLoading } = useProfile()

  if (authLoading)
    return (
      <div className="py-10">
        <Skeleton className="h-60" />
      </div>
    )
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/profile' }} replace />

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="font-serif text-4xl">Профіль</h1>

      {isLoading ? (
        <Skeleton className="mt-6 h-40" />
      ) : profile ? (
        <section className="mt-6 rounded-2xl border border-white/10 bg-bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-primary-live">Нікнейм</p>
          <p className="mt-1 font-serif text-2xl">{profile.nickname}</p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-rose-dust/70">Баланс</p>
              <p className="font-mono text-xl">{profile.balance}</p>
            </div>
            <div>
              <p className="text-rose-dust/70">Ставок зроблено</p>
              <p className="font-mono text-xl">{profile.total_bets}</p>
            </div>
          </div>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => signOut()}
        className="mt-8 rounded-lg border border-white/20 px-5 py-2 text-sm text-rose-dust hover:border-primary-live hover:text-primary-live"
      >
        Вийти
      </button>
    </div>
  )
}
