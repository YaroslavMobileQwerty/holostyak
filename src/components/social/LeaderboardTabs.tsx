import type { LeaderboardScope } from '@/hooks/useLeaderboard'

const tabs: { id: LeaderboardScope; label: string }[] = [
  { id: 'all', label: 'Весь час' },
  { id: 'season', label: 'Сезон' },
  { id: 'week', label: 'Тиждень' },
]

export function LeaderboardTabs({
  value,
  onChange,
}: {
  value: LeaderboardScope
  onChange: (s: LeaderboardScope) => void
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm ${
            value === t.id
              ? 'bg-primary text-white'
              : 'border border-white/15 text-rose-dust hover:border-primary-live/50'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
