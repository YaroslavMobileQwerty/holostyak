import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAdminListUsers } from '@/hooks/admin/useAdminListUsers'
import { exportUsersCsv, type UserCsvRow } from '@/lib/exportUsersCsv'
import { Skeleton } from '@/components/ui/Skeleton'

export function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<'all' | 'user' | 'admin'>('all')
  const [banned, setBanned] = useState<'all' | 'yes' | 'no'>('all')
  const [minB, setMinB] = useState('')
  const [maxB, setMaxB] = useState('')
  const { data, isLoading } = useAdminListUsers({
    search,
    role,
    banned,
    minBalance: minB,
    maxBalance: maxB,
  })

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Користувачі</h1>
      <p className="mt-1 text-sm text-rose-dust">RPC: email, бан, фільтри. До 200 записів.</p>
      <div className="mt-4 flex max-w-4xl flex-col gap-2 sm:flex-row sm:flex-wrap">
        <input
          type="search"
          placeholder="Пошук ніку"
          className="max-w-sm flex-1 rounded-lg border border-white/15 bg-bg-base px-3 py-2 text-rose-cream"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded border border-white/15 bg-bg-base px-2 py-2"
          value={role}
          onChange={(e) => setRole(e.target.value as 'all' | 'user' | 'admin')}
        >
          <option value="all">Роль: всі</option>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
        <select
          className="rounded border border-white/15 bg-bg-base px-2 py-2"
          value={banned}
          onChange={(e) => setBanned(e.target.value as 'all' | 'yes' | 'no')}
        >
          <option value="all">Бан: всі</option>
          <option value="yes">забанені</option>
          <option value="no">активні</option>
        </select>
        <input
          placeholder="min баланс"
          className="w-24 rounded border border-white/15 bg-bg-base px-2 py-1 font-mono"
          value={minB}
          onChange={(e) => setMinB(e.target.value)}
        />
        <input
          placeholder="max"
          className="w-24 rounded border border-white/15 bg-bg-base px-2 py-1 font-mono"
          value={maxB}
          onChange={(e) => setMaxB(e.target.value)}
        />
        <button
          type="button"
          className="rounded border border-primary/30 px-3 py-2 text-sm text-primary-live"
          onClick={() => {
            if (!data?.length) {
              toast.error('Немає даних')
              return
            }
            const csv = exportUsersCsv(data as UserCsvRow[])
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'users.csv'
            a.click()
            URL.revokeObjectURL(a.href)
            toast.success('Експорт')
          }}
        >
          Експорт CSV
        </button>
      </div>

      {isLoading ? (
        <Skeleton className="mt-6 h-64" />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-white/10 bg-bg-elevated/80 text-xs uppercase text-rose-dust">
              <tr>
                <th className="px-3 py-3">Нікнейм</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Баланс</th>
                <th className="px-3 py-3">Роль</th>
                <th className="px-3 py-3">Бан</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {data?.length ? (
                data.map((row) => (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="px-3 py-3 text-rose-cream">{row.nickname ?? '—'}</td>
                    <td className="px-3 py-3 font-mono text-xs text-rose-dust">{row.email}</td>
                    <td className="px-3 py-3 font-mono">{row.balance}</td>
                    <td className="px-3 py-3 text-rose-dust">{row.role}</td>
                    <td className="px-3 py-3">{row.is_banned ? 'так' : 'ні'}</td>
                    <td className="px-3 py-3">
                      <Link
                        to={`/admin/user/${row.id}`}
                        className="text-primary-live underline-offset-2 hover:underline"
                      >
                        Картка
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-rose-dust">
                    Порожньо
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
