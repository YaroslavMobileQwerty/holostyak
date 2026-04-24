import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function PublicHeader() {
  const { isAuthenticated, user } = useAuth()
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
        </nav>
        {isAuthenticated ? (
          <Link to="/profile" className="text-sm text-rose-dust hover:text-primary-live">
            {user?.email?.split('@')[0]}
          </Link>
        ) : (
          <Link to="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium">
            Увійти
          </Link>
        )}
      </div>
    </header>
  )
}
