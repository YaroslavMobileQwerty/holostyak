import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useIsAdmin } from '@/hooks/useIsAdmin'
import { NotificationsBell } from '@/components/notifications/NotificationsBell'
import { useSound } from '@/sound/useSound'

export function PublicHeader() {
  const { isAuthenticated, user } = useAuth()
  const { isAdmin } = useIsAdmin()
  const { muted, setMuted } = useSound()
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-bg-base/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-serif text-xl text-primary-live">
          Холостяк · Ставки
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          <Link to="/show" className="hover:text-primary-live">
            Про шоу
          </Link>
          <Link to="/season" className="hover:text-primary-live">
            Сезон
          </Link>
          <Link to="/episodes" className="hover:text-primary-live">
            Випуски
          </Link>
          <Link to="/leaderboard" className="hover:text-primary-live">
            Лідерборд
          </Link>
          <Link to="/coins" className="hover:text-primary-live">
            Донат / бали
          </Link>
          {isAuthenticated ? (
            <Link to="/my-bets" className="hover:text-primary-live">
              Мої ставки
            </Link>
          ) : null}
          {isAuthenticated ? (
            <Link to="/wallet" className="hover:text-primary-live">
              Гаманець
            </Link>
          ) : null}
          {isAuthenticated ? (
            <Link to="/prizes" className="hover:text-primary-live">
              Призи
            </Link>
          ) : null}
          {isAdmin ? (
            <Link to="/admin/dashboard" className="hover:text-primary-live">
              Адмінка
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-3">
          {setMuted ? (
            <button
              type="button"
              aria-label={muted ? 'Увімкнути звук' : 'Вимкнути звук'}
              aria-pressed={!muted}
              className="rounded-lg border border-white/15 px-2 py-1.5 text-sm text-rose-dust hover:border-primary/40 hover:text-primary-live"
              onClick={() => setMuted(!muted)}
            >
              {muted ? '🔇' : '🔈'}
            </button>
          ) : null}
          {isAuthenticated ? <NotificationsBell /> : null}
          {isAuthenticated ? (
            <Link to="/profile" className="text-sm text-rose-dust hover:text-primary-live">
              {user?.email?.split('@')[0]}
            </Link>
          ) : (
            <Link to="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
              Увійти
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
