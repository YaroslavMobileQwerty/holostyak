import { Link, Navigate } from 'react-router-dom'
import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useAnimatedBalance } from '@/hooks/useAnimatedBalance'
import { useMyAchievements } from '@/hooks/useMyAchievements'
import { AchievementBadge } from '@/components/social/AchievementBadge'
import { Skeleton } from '@/components/ui/Skeleton'

export function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading, signOut } = useAuth()
  const { data: profile, isLoading } = useProfile()
  const { display: balanceDisplay, delta } = useAnimatedBalance(profile?.balance)
  const { data: achievements } = useMyAchievements()
  const recent = useMemo(
    () =>
      [...(achievements ?? [])]
        .filter((a) => a.unlocked_at)
        .sort((a, b) => (a.unlocked_at! < b.unlocked_at! ? 1 : -1))
        .slice(0, 4),
    [achievements],
  )

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
        <section className="relative mt-6 rounded-2xl border border-white/10 bg-bg-card p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-primary-live">Нікнейм</p>
          <p className="mt-1 font-serif text-2xl">{profile.nickname}</p>
          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-rose-dust/70">Баланс</p>
              <p className="font-mono text-xl">{balanceDisplay}</p>
              <AnimatePresence>
                {delta != null && delta > 0 ? (
                  <motion.span
                    key={delta}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-1 block font-mono text-sm text-primary-live"
                  >
                    +{delta}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </div>
            <div>
              <p className="text-rose-dust/70">Ставок зроблено</p>
              <p className="font-mono text-xl">{profile.total_bets}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-8 rounded-2xl border border-white/10 bg-bg-card p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-serif text-xl text-rose-cream">Мої досягнення</h2>
          <Link to="/achievements" className="text-sm text-primary-live hover:underline">
            Усі бейджі
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-rose-dust">Ще немає відкритих бейджів — зроби ставку або поповни бали.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {recent.map((a) => (
              <AchievementBadge key={a.id} achievement={a} locked={false} />
            ))}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <Link
          to="/wallet"
          className="rounded-lg border border-white/20 px-4 py-2 text-rose-dust hover:border-primary-live hover:text-primary-live"
        >
          Гаманець
        </Link>
        <Link
          to="/coins"
          className="rounded-lg border border-white/20 px-4 py-2 text-rose-dust hover:border-primary-live hover:text-primary-live"
        >
          Поповнити бали
        </Link>
      </div>

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
