import { useState } from 'react'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import type { Tables } from '@/lib/database.types'
import {
  useAdminPurchaseQueue,
  type PurchaseStatusFilter,
} from '@/hooks/admin/useAdminPurchaseQueue'
import { PurchaseReviewModal } from '@/components/admin/PurchaseReviewModal'
import { Skeleton } from '@/components/ui/Skeleton'

type QueueRow = Tables<'coin_purchase_requests'> & {
  user: { nickname: string | null } | null
}

const filters: { value: PurchaseStatusFilter; label: string }[] = [
  { value: 'pending', label: 'Очікують' },
  { value: 'all', label: 'Усі' },
  { value: 'approved', label: 'Підтверджені' },
  { value: 'rejected', label: 'Відхилені' },
]

export function PurchaseQueueTable() {
  const [status, setStatus] = useState<PurchaseStatusFilter>('pending')
  const [selected, setSelected] = useState<QueueRow | null>(null)
  const { data, isLoading } = useAdminPurchaseQueue(status)

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatus(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              status === f.value
                ? 'bg-primary text-white'
                : 'border border-white/15 text-rose-dust hover:border-primary/40'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 bg-bg-elevated/80 text-xs uppercase tracking-wider text-rose-dust">
              <tr>
                <th className="px-3 py-3">Дата</th>
                <th className="px-3 py-3">Користувач</th>
                <th className="px-3 py-3">Сума</th>
                <th className="px-3 py-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).length ? (
                (data as QueueRow[]).map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-b border-white/5 hover:bg-white/[0.03]"
                    onClick={() => setSelected(row)}
                  >
                    <td className="px-3 py-3 text-rose-dust">
                      {format(new Date(row.created_at), 'd MMM yyyy HH:mm', { locale: uk })}
                    </td>
                    <td className="px-3 py-3 text-rose-cream">
                      {row.user?.nickname ?? row.user_id.slice(0, 8) + '…'}
                    </td>
                    <td className="px-3 py-3 font-mono">{row.requested_amount}</td>
                    <td className="px-3 py-3 capitalize text-rose-dust">{row.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 py-8 text-center text-rose-dust">
                    Немає заявок
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <PurchaseReviewModal row={selected} open onClose={() => setSelected(null)} />
      ) : null}
    </div>
  )
}
