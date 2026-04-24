import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import type { Tables } from '@/lib/database.types'

type Row = Tables<'coin_purchase_requests'>

const statusUi: Record<string, { label: string; className: string }> = {
  pending: { label: 'На перевірці', className: 'text-amber-300 border-amber-500/40' },
  approved: { label: 'Підтверджено', className: 'text-emerald-300 border-emerald-500/40' },
  rejected: { label: 'Відхилено', className: 'text-rose-400 border-rose-500/40' },
}

export function PurchaseStatusCard({ row }: { row: Row }) {
  const ui = statusUi[row.status] ?? statusUi.pending
  return (
    <article
      className={`rounded-xl border bg-bg-elevated/50 p-4 ${ui.className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wider">{ui.label}</span>
        <time className="text-xs text-rose-dust/80" dateTime={row.created_at}>
          {format(new Date(row.created_at), 'd MMM yyyy, HH:mm', { locale: uk })}
        </time>
      </div>
      <p className="mt-2 font-mono text-lg">{row.requested_amount} ₴ → бали</p>
      {row.status === 'approved' && row.approved_amount != null ? (
        <p className="mt-1 text-sm text-rose-dust">Нараховано балів: {row.approved_amount}</p>
      ) : null}
      {row.status === 'rejected' && row.admin_comment ? (
        <p className="mt-2 text-sm text-rose-dust/90">Причина: {row.admin_comment}</p>
      ) : null}
      {row.user_comment ? (
        <p className="mt-2 text-xs text-rose-dust/70">Ваш коментар: {row.user_comment}</p>
      ) : null}
    </article>
  )
}
