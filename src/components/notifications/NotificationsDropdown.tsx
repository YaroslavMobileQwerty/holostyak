import type { Tables } from '@/lib/database.types'
import { NotificationItem } from './NotificationItem'

export function NotificationsDropdown({
  items,
  onRead,
  onClose,
}: {
  items: Tables<'notifications'>[]
  onRead: (id: string) => void
  onClose: () => void
}) {
  return (
    <div
      className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-white/15 bg-bg-card p-3 shadow-xl"
      role="menu"
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs uppercase tracking-wider text-rose-dust">Сповіщення</p>
        <button type="button" className="text-xs text-rose-dust hover:text-primary-live" onClick={onClose}>
          Закрити
        </button>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-rose-dust">Поки порожньо</p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {items.map((n) => (
            <NotificationItem key={n.id} n={n} onRead={onRead} />
          ))}
        </ul>
      )}
    </div>
  )
}
