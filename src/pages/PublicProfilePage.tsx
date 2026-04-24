import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { usePublicProfile } from '@/hooks/usePublicProfile'
import { useUserAchievementsPublic } from '@/hooks/useMyAchievements'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { UserAvatar } from '@/components/social/UserAvatar'
import { AchievementsGrid } from '@/components/social/AchievementsGrid'
import { formatAccuracy } from '@/lib/formatAccuracy'
import { Skeleton } from '@/components/ui/Skeleton'

export function PublicProfilePage() {
  const { nickname: raw } = useParams<{ nickname: string }>()
  const nickname = raw ? decodeURIComponent(raw) : undefined
  const { data: profile, isLoading } = usePublicProfile(nickname)
  const { data: achievements = [] } = useUserAchievementsPublic(profile?.id)
  const { user } = useAuth()
  const { data: myProfile } = useProfile()
  const isOwn = user?.id && profile?.id === user.id

  if (isLoading) {
    return (
      <div className="py-10">
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="py-10 text-center">
        <h1 className="font-serif text-2xl">Користувача не знайдено</h1>
        <Link to="/leaderboard" className="mt-4 inline-block text-primary-live hover:underline">
          До лідерборду
        </Link>
      </div>
    )
  }

  const acc = formatAccuracy(profile.correct_bets, profile.total_bets)
  const myAcc = myProfile
    ? formatAccuracy(myProfile.correct_bets, myProfile.total_bets)
    : '—'
  const viewerCompare =
    user && profile.id !== user.id && myProfile ? (
      <section className="mt-8 rounded-2xl border border-white/10 bg-bg-card/80 p-6">
        <h2 className="font-serif text-xl text-rose-cream">Ти vs {profile.nickname}</h2>
        <ul className="mt-4 grid gap-3 text-sm text-rose-dust sm:grid-cols-2">
          <li className="rounded-lg border border-white/10 bg-bg-base/50 p-3">
            <p className="text-xs uppercase tracking-wider text-rose-dust/80">Виграно балів</p>
            <p className="mt-1 font-mono text-rose-cream">
              ти {myProfile.total_won} · вони {profile.total_won}
            </p>
          </li>
          <li className="rounded-lg border border-white/10 bg-bg-base/50 p-3">
            <p className="text-xs uppercase tracking-wider text-rose-dust/80">Точність</p>
            <p className="mt-1 font-mono text-rose-cream">
              ти {myAcc} · вони {acc}
            </p>
          </li>
          <li className="rounded-lg border border-white/10 bg-bg-base/50 p-3">
            <p className="text-xs uppercase tracking-wider text-rose-dust/80">Вдалих ставок</p>
            <p className="mt-1 font-mono text-rose-cream">
              ти {myProfile.correct_bets} · вони {profile.correct_bets}
            </p>
          </li>
          <li className="rounded-lg border border-white/10 bg-bg-base/50 p-3">
            <p className="text-xs uppercase tracking-wider text-rose-dust/80">Найкраща серія</p>
            <p className="mt-1 font-mono text-rose-cream">
              ти {myProfile.streak_best} · вони {profile.streak_best}
            </p>
          </li>
        </ul>
      </section>
    ) : null

  return (
    <div className="mx-auto max-w-3xl py-10">
      <Helmet>
        <title>{profile.nickname ?? 'Профіль'} — Холостяк</title>
      </Helmet>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <UserAvatar url={profile.avatar_url} nickname={profile.nickname} size={96} />
        <div className="text-center sm:text-left">
          <h1 className="font-serif text-4xl text-rose-cream">{profile.nickname}</h1>
          <p className="mt-1 text-sm text-rose-dust">
            На платформі з {new Date(profile.created_at).toLocaleDateString('uk-UA')}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-rose-dust/70">Виграно</dt>
              <dd className="font-mono text-lg">{profile.total_won}</dd>
            </div>
            <div>
              <dt className="text-rose-dust/70">Ставок</dt>
              <dd className="font-mono text-lg">{profile.total_bets}</dd>
            </div>
            <div>
              <dt className="text-rose-dust/70">Точність</dt>
              <dd className="font-mono text-lg">{acc}</dd>
            </div>
            <div>
              <dt className="text-rose-dust/70">Найкраща серія</dt>
              <dd className="font-mono text-lg">{profile.streak_best}</dd>
            </div>
          </dl>
          {isOwn ? (
            <Link
              to="/profile"
              className="mt-4 inline-block text-sm text-primary-live hover:underline"
            >
              Редагувати профіль
            </Link>
          ) : null}
        </div>
      </div>

      {viewerCompare}

      <section className="mt-10">
        <h2 className="font-serif text-2xl">Досягнення</h2>
        {achievements.length === 0 ? (
          <p className="mt-4 text-rose-dust">Ще жодного відкритого бейджа.</p>
        ) : (
          <div className="mt-4">
            <AchievementsGrid items={achievements} />
          </div>
        )}
      </section>
    </div>
  )
}
