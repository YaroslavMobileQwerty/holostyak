import type { AchievementWithUnlock } from '@/hooks/useMyAchievements'

const tierRing: Record<string, string> = {
  bronze: 'border-amber-700/60 shadow-amber-900/30',
  silver: 'border-slate-400/50 shadow-slate-500/20',
  gold: 'border-amber-300/60 shadow-amber-200/20',
  platinum: 'border-cyan-300/50 shadow-cyan-400/20',
}

export function AchievementBadge({
  achievement,
  locked,
}: {
  achievement: Pick<AchievementWithUnlock, 'title' | 'description' | 'icon' | 'tier'>
  locked: boolean
}) {
  const ring = tierRing[achievement.tier] ?? 'border-white/20'
  return (
    <div
      title={`${achievement.title} — ${achievement.description}`}
      className={`flex flex-col items-center gap-1 rounded-xl border bg-bg-card/80 p-3 text-center ${
        locked ? 'border-white/10 opacity-45 grayscale' : ring
      }`}
    >
      <span className="text-2xl" aria-hidden>
        {achievement.icon ?? '🏅'}
      </span>
      <span className="text-xs font-medium text-rose-cream">{achievement.title}</span>
    </div>
  )
}
