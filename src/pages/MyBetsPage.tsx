import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import { useAuth } from '@/hooks/useAuth'
import { useMyBets } from '@/hooks/useMyBets'
import { Skeleton } from '@/components/ui/Skeleton'

const STATUS = [
  { value: '', label: 'Усі' },
  { value: 'pending', label: 'Активні' },
  { value: 'won', label: 'Виграші' },
  { value: 'lost', label: 'Програші' },
  { value: 'void', label: 'Скасовані' },
] as const

export function MyBetsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [st, setSt] = useState<string>('')
  const [page, setPage] = useState(0)
  const { data, isLoading } = useMyBets(st || null, page)

  if (authLoading)
    return (
      <div className="py-10">
        <Skeleton className="h-40" />
      </div>
    )
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/my-bets' }} replace />

  return (
    <div className="mx-auto max-w-4xl py-10">
      <h1 className="font-serif text-4xl text-rose-cream">Мої ставки</h1>
      <p className="mt-2 text-sm text-rose-dust">Історія та статуси ваших прогнозів.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => {
              setSt(o.value)
              setPage(0)
            }}
            className={`rounded-full px-3 py-1 text-sm ${
              st === o.value ? 'bg-primary/30 text-rose-cream' : 'border border-white/10 text-rose-dust'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="mt-6 h-64" />
      ) : !data?.rows.length ? (
        <div className="mt-10 rounded-2xl border border-white/10 p-8 text-center text-rose-dust">
          <p>Ставок ще немає.</p>
          <Link to="/episodes" className="mt-4 inline-block text-primary-live">
            До випусків
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {data.rows.map((row) => {
            const be = row.bet_events as {
              id: string
              title: string
              status: string
              closes_at: string
              episodes: { number: number; title: string | null } | null
            } | null
            const ep = be?.episodes
            return (
              <li
                key={row.id}
                className="rounded-xl border border-white/10 bg-bg-card/50 px-4 py-3 text-sm"
              >
                <p className="font-medium text-rose-cream">{be?.title ?? 'Подія'}</p>
                <p className="text-rose-dust">
                  {ep ? `Випуск ${ep.number}` : ''}
                  {ep?.title ? ` — ${ep.title}` : ''}
                </p>
                <p className="mt-1 text-rose-dust/80">
                  {row.amount} б. → потенціал {row.potential_payout} · {row.status}
                </p>
                <p className="text-xs text-rose-dust/60">
                  {format(new Date(row.placed_at), "d MMM yyyy, HH:mm", { locale: uk })}
                </p>
              </li>
            )
          })}
        </ul>
      )}

      {data && data.total > data.pageSize * (page + 1) ? (
        <button
          type="button"
          className="mt-4 text-sm text-primary-live"
          onClick={() => setPage((p) => p + 1)}
        >
          Далі
        </button>
      ) : null}
      {page > 0 ? (
        <button
          type="button"
          className="ml-4 mt-4 text-sm text-rose-dust"
          onClick={() => setPage((p) => p - 1)}
        >
          Назад
        </button>
      ) : null}
    </div>
  )
}
