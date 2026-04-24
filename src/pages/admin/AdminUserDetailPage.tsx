import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useProfile } from '@/hooks/useProfile'
import { useUserAchievementsForUser } from '@/hooks/useMyAchievements'
import { useAdminUserById } from '@/hooks/admin/useAdminUserDetailData'
import {
  useAdminAuditForUser,
  useBetsForUser,
  useCoinTransactionsForUser,
  usePurchaseRequestsForUser,
} from '@/hooks/admin/useAdminUserDetailData'
import { UserActionsPanel } from '@/components/admin/UserActionsPanel'
import { AchievementsGrid } from '@/components/social/AchievementsGrid'
import { Skeleton } from '@/components/ui/Skeleton'

const tabs = ['огляд', 'гаманець', 'ставки', 'заявки', 'дії', 'аудит'] as const
type Tab = (typeof tabs)[number]

function tabLabel(t: Tab) {
  const map: Record<Tab, string> = {
    огляд: 'Огляд',
    гаманець: 'Гаманець',
    ставки: 'Ставки',
    заявки: 'Заявки',
    дії: 'Дії',
    аудит: 'Аудит',
  }
  return map[t]
}

export function AdminUserDetailPage() {
  const { id = '' } = useParams()
  const { data: me } = useProfile()
  const { data: users, isLoading: uLoading } = useAdminUserById(id)
  const user = users?.[0] ?? null
  const { data: ach } = useUserAchievementsForUser(id)
  const { data: ledger, isLoading: lLoading } = useCoinTransactionsForUser(id)
  const { data: bets, isLoading: bLoading } = useBetsForUser(id)
  const { data: purchases, isLoading: pLoading } = usePurchaseRequestsForUser(id)
  const { data: userAudit, isLoading: aLoading } = useAdminAuditForUser(id)
  const [tab, setTab] = useState<Tab>('огляд')

  const isSelf = me?.id === id
  const betRows = !bets ? [] : Array.isArray(bets) ? bets : [bets]

  return (
    <div>
      <Helmet>
        <title>Користувач — Адмін</title>
      </Helmet>
      <Link
        to="/admin/users"
        className="text-sm text-primary-live underline-offset-2 hover:underline"
      >
        ← До списку
      </Link>

      {uLoading || !id ? (
        <Skeleton className="mt-6 h-40" />
      ) : !user ? (
        <p className="mt-6 text-rose-dust">Користувача не знайдено.</p>
      ) : (
        <>
          <h1 className="mt-4 font-serif text-3xl text-rose-cream">
            {user.nickname ?? user.id.slice(0, 8)} <span className="text-rose-dust/80">({user.email})</span>
          </h1>
          <p className="mt-1 text-sm text-rose-dust">
            ID: {user.id} · Баланс: {user.balance} · Ставок: {user.total_bets} / влучно: {user.correct_bets} ·
            {user.is_banned ? ' заблоковано' : ' активний'} · {user.role}
          </p>

          <div className="mt-4 flex flex-wrap gap-1 border-b border-white/10 pb-2">
            {tabs.map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  tab === t
                    ? 'bg-primary/25 text-rose-cream'
                    : 'text-rose-dust hover:bg-white/5'
                }`}
              >
                {tabLabel(t)}
              </button>
            ))}
          </div>

          {tab === 'огляд' && (
            <div className="mt-6">
              <h2 className="font-serif text-lg text-rose-cream">Досягнення</h2>
              <div className="mt-2">
                <AchievementsGrid items={ach ?? []} />
              </div>
            </div>
          )}

          {tab === 'гаманець' && (
            <div className="mt-6 overflow-x-auto">
              {lLoading ? <Skeleton className="h-48" /> : null}
              {ledger && ledger.length > 0 ? (
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-rose-dust">
                      <th className="py-2">Час</th>
                      <th>Тип</th>
                      <th>Delta</th>
                      <th>Після</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((r) => (
                      <tr key={r.id} className="border-b border-white/5">
                        <td className="font-mono text-xs text-rose-dust">{r.created_at}</td>
                        <td>{r.kind}</td>
                        <td className="font-mono">{r.delta}</td>
                        <td className="font-mono">{r.balance_after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : lLoading ? null : (
                <p className="text-rose-dust">Порожньо</p>
              )}
            </div>
          )}

          {tab === 'ставки' && (
            <div className="mt-6 overflow-x-auto">
              {bLoading ? <Skeleton className="h-48" /> : null}
              {betRows.length > 0 ? (
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-rose-dust">
                      <th className="py-2">Час</th>
                      <th>Подія</th>
                      <th>Сума</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {betRows.map((b) => {
                      const ev = b.bet_events as { title: string; status: string } | null
                      return (
                        <tr key={b.id} className="border-b border-white/5">
                          <td className="text-xs text-rose-dust">{b.placed_at}</td>
                          <td>{ev?.title ?? '—'}</td>
                          <td className="font-mono">{b.amount}</td>
                          <td>{b.status}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : bLoading ? null : (
                <p className="text-rose-dust">Порожньо</p>
              )}
            </div>
          )}

          {tab === 'заявки' && (
            <div className="mt-6 overflow-x-auto">
              {pLoading ? <Skeleton className="h-40" /> : null}
              {purchases && purchases.length > 0 ? (
                <table className="w-full min-w-[500px] text-left text-sm">
                  <tbody>
                    {purchases.map((r) => (
                      <tr key={r.id} className="border-b border-white/5">
                        <td className="py-2 text-xs text-rose-dust">{r.created_at}</td>
                        <td>{r.status}</td>
                        <td className="font-mono">{r.requested_amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : pLoading ? null : (
                <p className="text-rose-dust">Порожньо</p>
              )}
            </div>
          )}

          {tab === 'дії' && <UserActionsPanel user={user} isSelf={isSelf} />}

          {tab === 'аудит' && (
            <div className="mt-6 space-y-3">
              {aLoading ? <Skeleton className="h-40" /> : null}
              {userAudit?.map((r) => (
                <div key={r.id} className="rounded border border-white/10 p-3 text-xs">
                  <p className="text-rose-dust">
                    {r.created_at} — {r.action} · {r.target_type}
                  </p>
                  <pre className="mt-1 overflow-x-auto text-[11px] text-rose-cream/90">
                    {r.payload == null ? '—' : JSON.stringify(r.payload, null, 2)}
                  </pre>
                </div>
              ))}
              {userAudit && userAudit.length === 0 && !aLoading ? (
                <p className="text-rose-dust">Порожньо</p>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  )
}
