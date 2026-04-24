import { NavLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const publicLinks = [
  { to: '/', label: 'Головна' },
  { to: '/episodes', label: 'Випуски' },
  { to: '/leaderboard', label: 'Топ' },
]

export function MobileBottomNav() {
  const { isAuthenticated } = useAuth()
  const links = isAuthenticated
    ? [
        ...publicLinks,
        { to: '/my-bets', label: 'Ставки' },
        { to: '/wallet', label: 'Бали' },
        { to: '/prizes', label: 'Призи' },
        { to: '/profile', label: 'Профіль' },
      ]
    : [...publicLinks, { to: '/login', label: 'Увійти' }]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-bg-base/95 backdrop-blur md:hidden">
      <ul className="flex">
        {links.map((l) => (
          <li key={l.to} className="flex-1">
            <NavLink
              to={l.to}
              end
              className={({ isActive }) =>
                `flex flex-col items-center py-3 text-xs ${isActive ? 'text-primary-live' : 'text-rose-dust'}`
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
