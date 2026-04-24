import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'

interface Props {
  id: string
  number: number
  title?: string | null
  airsAt?: string | null
  status: string
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Незабаром',
  open: 'Ставки відкрито',
  locked: 'Очікуємо ефір',
  live: 'У ефірі!',
  finalized: 'Завершено',
}

export function EpisodeCard({ id, number, title, airsAt, status }: Props) {
  return (
    <Link
      to={`/episode/${id}`}
      className="block rounded-2xl border border-white/10 bg-bg-card p-5 transition hover:border-primary/40"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.3em] text-primary-live">Випуск {number}</p>
        {status === 'live' && (
          <span className="flex items-center gap-1.5 text-xs text-primary-live">
            <span className="size-2 animate-pulse-live rounded-full bg-primary-live" />
            LIVE
          </span>
        )}
      </div>
      <h3 className="mt-1 font-serif text-2xl">{title ?? `Випуск ${number}`}</h3>
      <div className="mt-3 flex items-center justify-between text-sm text-rose-dust">
        <span>{STATUS_LABEL[status]}</span>
        {airsAt && <span>{format(new Date(airsAt), 'dd MMM HH:mm', { locale: uk })}</span>}
      </div>
    </Link>
  )
}
