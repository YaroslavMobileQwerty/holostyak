import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import type { LeaderboardScope } from '@/hooks/useLeaderboard'
import { useLeaderboard, useMyLeaderboardRow } from '@/hooks/useLeaderboard'
import { LeaderboardTabs } from '@/components/social/LeaderboardTabs'
import { LeaderboardRow } from '@/components/social/LeaderboardRow'
import { Skeleton } from '@/components/ui/Skeleton'

export function LeaderboardPage() {
  const [scope, setScope] = useState<LeaderboardScope>('all')
  const { data: rows, isLoading } = useLeaderboard(scope)
  const { data: self } = useMyLeaderboardRow(scope)

  const inTop100 = self && rows?.some((r) => r.user_id === self.user_id)
  const selfRank = self?.rank_by_won

  return (
    <div className="py-10">
      <Helmet>
        <title>Лідерборд — Холостяк</title>
      </Helmet>
      <h1 className="font-serif text-4xl">Лідерборд</h1>
      <p className="mt-2 text-rose-dust">Топ прогнозистів за виграними балами.</p>

      <div className="mt-6">
        <LeaderboardTabs value={scope} onChange={setScope} />
      </div>

      <div className="mt-6 w-full min-w-0 overflow-x-auto rounded-2xl border border-white/10 bg-bg-card">
        {isLoading ? (
          <div className="p-6">
            <Skeleton className="h-64" />
          </div>
        ) : (
          <table className="w-max min-w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase leading-tight tracking-wide text-rose-dust sm:tracking-wider">
                <th
                  scope="col"
                  className="whitespace-nowrap py-2.5 pl-3 pr-2 font-medium sm:py-3"
                >
                  #
                </th>
                <th scope="col" className="min-w-32 max-w-sm py-2.5 pr-3 font-medium sm:min-w-48 sm:py-3 sm:pr-4">
                  Гравець
                </th>
                <th
                  scope="col"
                  className="whitespace-nowrap py-2.5 pr-3 text-right font-medium sm:py-3"
                >
                  Виграно
                </th>
                <th
                  scope="col"
                  className="hidden whitespace-nowrap py-2.5 pr-3 text-right font-medium sm:table-cell sm:py-3"
                >
                  Точність
                </th>
                <th
                  scope="col"
                  className="hidden whitespace-nowrap py-2.5 pr-3 text-right font-medium md:table-cell md:py-3"
                >
                  Серія
                </th>
                <th
                  scope="col"
                  className="hidden whitespace-nowrap py-2.5 pr-3 text-right font-medium last:pr-4 lg:table-cell lg:py-3"
                >
                  Бейджі
                </th>
              </tr>
            </thead>
            <tbody>
              {(rows ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-2 py-12 text-center text-rose-dust sm:px-3">
                    Поки немає даних для цього періоду.
                  </td>
                </tr>
              ) : (
                (rows ?? []).map((r) => <LeaderboardRow key={r.user_id} row={r} />)
              )}
            </tbody>
          </table>
        )}
      </div>

      {self && !inTop100 && selfRank != null ? (
        <p className="mt-4 text-center text-sm text-rose-dust">
          Ти на #{selfRank} — зіграй більше виграшних прогнозів, щоб потрапити в топ-100.
        </p>
      ) : null}
    </div>
  )
}
