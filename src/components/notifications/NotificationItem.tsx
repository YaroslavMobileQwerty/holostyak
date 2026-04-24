import { Link } from 'react-router-dom'
import type { Tables } from '@/lib/database.types'

export function NotificationItem({
  n,
  onRead,
}: {
  n: Tables<'notifications'>
  onRead: (id: string) => void
}) {
  const href = n.action_url ?? undefined
  const inner = (
    <div
      className={`rounded-lg border px-3 py-2 text-left text-sm ${
        n.is_read ? 'border-white/5 bg-white/5' : 'border-primary/30 bg-primary/10'
      }`}
    >
      <p className="font-medium text-rose-cream">{n.title}</p>
      {n.body ? <p className="mt-1 text-xs text-rose-dust">{n.body}</p> : null}
    </div>
  )
  return (
    <li>
      {href ? (
        <Link
          to={href}
          className="block"
          onClick={() => {
            if (!n.is_read) onRead(n.id)
          }}
        >
          {inner}
        </Link>
      ) : (
        <button
          type="button"
          className="block w-full"
          onClick={() => {
            if (!n.is_read) onRead(n.id)
          }}
        >
          {inner}
        </button>
      )}
    </li>
  )
}
