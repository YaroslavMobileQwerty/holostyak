import type { AchievementWithUnlock } from '@/hooks/useMyAchievements'
import { AchievementBadge } from './AchievementBadge'

export function AchievementsGrid({ items }: { items: AchievementWithUnlock[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((a) => (
        <AchievementBadge key={a.id} achievement={a} locked={!a.unlocked_at} />
      ))}
    </div>
  )
}
