import { Link } from 'react-router-dom'
import type { LeaderboardRowModel } from '@/hooks/useLeaderboard'
import { formatAccuracy } from '@/lib/formatAccuracy'
import { UserAvatar } from './UserAvatar'

export function LeaderboardRow({ row }: { row: LeaderboardRowModel }) {
  const nick = row.nickname ?? '—'
  const enc = encodeURIComponent(nick)
  return (
    <tr className="border-b border-white/5 text-sm text-rose-cream/90">
      <td className="py-2.5 pl-3 pr-1 font-mono text-rose-dust sm:py-3">#{row.rank_by_won}</td>
      <td className="min-w-0 py-2.5 pr-1 sm:py-3 sm:pr-2">
        <Link
          to={`/u/${enc}`}
          className="flex min-w-0 max-w-full items-center gap-2 sm:gap-3"
        >
          <UserAvatar url={row.avatar_url} nickname={row.nickname} size={36} />
          <span className="min-w-0 flex-1 truncate font-medium" title={nick}>
            {nick}
          </span>
        </Link>
      </td>
      <td className="whitespace-nowrap py-2.5 pr-3 text-right font-mono sm:py-3">
        {row.total_won}
      </td>
      <td className="hidden whitespace-nowrap py-2.5 pr-3 text-right font-mono sm:table-cell sm:py-3">
        {formatAccuracy(row.correct_bets, row.total_bets)}
      </td>
      <td className="hidden whitespace-nowrap py-2.5 pr-3 text-right font-mono md:table-cell md:py-3">
        {row.streak_best}
      </td>
      <td className="hidden whitespace-nowrap py-2.5 pr-4 text-right font-mono lg:table-cell lg:py-3">
        {row.achievement_count}
      </td>
    </tr>
  )
}
