import { Suspense, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Skeleton } from '@/components/ui/Skeleton'

const links = [
  { to: '/admin/dashboard', label: 'Дашборд' },
  { to: '/admin/purchases', label: 'Заявки' },
  { to: '/admin/users', label: 'Користувачі' },
  { to: '/admin/seasons', label: 'Сезони' },
  { to: '/admin/bachelors', label: 'Холостяки' },
  { to: '/admin/participants', label: 'Учасниці' },
  { to: '/admin/episodes', label: 'Випуски' },
  { to: '/admin/resolution', label: 'Резолв' },
  { to: '/admin/broadcast', label: 'Розсилка' },
  { to: '/admin/audit', label: 'Аудит' },
  { to: '/admin/settings', label: 'Налаштування' },
  { to: '/admin/prizes', label: 'Призи' },
]

export function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="flex min-h-screen bg-bg-base">
        <aside className="hidden w-52 shrink-0 border-r border-white/10 bg-bg-card/50 p-4 md:block">
          <p className="font-serif text-lg text-primary-live">Адмінка</p>
          <nav className="mt-6 flex flex-col gap-1 text-sm">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 ${isActive ? 'bg-primary/20 text-primary-live' : 'text-rose-dust hover:bg-white/5'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <NavLink
              to="/"
              className="mt-4 rounded-lg px-3 py-2 text-rose-dust/80 hover:bg-white/5 hover:text-rose-cream"
            >
              ← На сайт
            </NavLink>
          </nav>
        </aside>
        <div className="min-w-0 flex-1 p-4 md:p-8">
          <div className="mb-4 flex items-center gap-2 md:hidden">
            <button
              type="button"
              className="rounded-lg border border-white/15 bg-bg-card px-3 py-2 text-sm text-rose-cream"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
            >
              Меню
            </button>
            {menuOpen ? (
              <nav className="absolute left-4 right-4 top-16 z-40 max-h-[70vh] overflow-y-auto rounded-xl border border-white/15 bg-bg-card p-3 shadow-xl">
                <div className="flex flex-col gap-1 text-sm">
                  {links.map((l) => (
                    <NavLink
                      key={l.to}
                      to={l.to}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2 ${isActive ? 'bg-primary/25 text-primary-live' : 'text-rose-dust'}`
                      }
                    >
                      {l.label}
                    </NavLink>
                  ))}
                  <NavLink to="/" className="rounded-lg px-3 py-2 text-rose-dust" onClick={() => setMenuOpen(false)}>
                    ← На сайт
                  </NavLink>
                </div>
              </nav>
            ) : null}
          </div>
          <Suspense fallback={<Skeleton className="h-96 w-full max-w-4xl" />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </>
  )
}
