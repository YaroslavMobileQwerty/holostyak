import { useState } from 'react'
import { toast } from 'sonner'
import type { Tables } from '@/lib/database.types'
import { useSignedScreenshotUrl } from '@/hooks/useSignedScreenshotUrl'
import { useApprovePurchase } from '@/hooks/admin/useApprovePurchase'
import { useRejectPurchase } from '@/hooks/admin/useRejectPurchase'

type QueueRow = Tables<'coin_purchase_requests'> & {
  user: { nickname: string | null } | null
}

export function PurchaseReviewModal({
  row,
  open,
  onClose,
}: {
  row: QueueRow
  open: boolean
  onClose: () => void
}) {
  const [approvedAmount, setApprovedAmount] = useState(row.requested_amount)
  const [adminNote, setAdminNote] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const { data: imageUrl } = useSignedScreenshotUrl(row.screenshot_url, open)
  const approve = useApprovePurchase()
  const reject = useRejectPurchase()

  if (!open) return null

  const pending = row.status === 'pending'

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-bg-card p-6 shadow-xl"
        role="dialog"
        aria-modal
        aria-labelledby="review-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="review-title" className="font-serif text-xl text-rose-cream">
          {pending ? 'Перевірка заявки' : 'Перегляд заявки'}
        </h2>
        <p className="mt-1 text-sm text-rose-dust">
          {row.user?.nickname ?? row.user_id} · запитано {row.requested_amount} (грн)
        </p>

        <div className="mt-4">
          {imageUrl ? (
            <img src={imageUrl} alt="Скріншот донату" className="max-h-64 rounded-lg border border-white/10" />
          ) : (
            <p className="text-sm text-rose-dust">Завантаження зображення…</p>
          )}
        </div>

        {pending ? (
          <>
            <label className="mt-4 block text-xs uppercase text-rose-dust/80">Сума до нарахування</label>
            <input
              type="number"
              min={1}
              className="mt-1 w-full rounded-lg border border-white/15 bg-bg-base px-3 py-2 font-mono text-rose-cream"
              value={approvedAmount}
              onChange={(e) => setApprovedAmount(Number(e.target.value))}
            />
            <label className="mt-3 block text-xs uppercase text-rose-dust/80">Примітка адміна</label>
            <input
              className="mt-1 w-full rounded-lg border border-white/15 bg-bg-base px-3 py-2 text-sm text-rose-cream"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Необовʼязково"
            />
            <label className="mt-3 block text-xs uppercase text-rose-dust/80">Причина відхилення</label>
            <textarea
              className="mt-1 w-full rounded-lg border border-white/15 bg-bg-base px-3 py-2 text-sm text-rose-cream"
              rows={2}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Якщо відхиляєте — вкажіть причину"
            />
          </>
        ) : (
          <div className="mt-4 text-sm text-rose-dust">
            <p>Статус: {row.status}</p>
            {row.admin_comment ? <p className="mt-2">Коментар: {row.admin_comment}</p> : null}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-rose-dust"
          >
            Закрити
          </button>
          {pending ? (
            <>
              <button
                type="button"
                disabled={approve.isPending || approvedAmount < 1}
                onClick={async () => {
                  try {
                    await approve.mutateAsync({
                      requestId: row.id,
                      approvedAmount,
                      adminNote: adminNote.trim() || null,
                    })
                    toast.success('Заявку підтверджено')
                    onClose()
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Помилка')
                  }
                }}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
              >
                Підтвердити
              </button>
              <button
                type="button"
                disabled={reject.isPending || !rejectReason.trim()}
                onClick={async () => {
                  try {
                    await reject.mutateAsync({ requestId: row.id, reason: rejectReason.trim() })
                    toast.success('Заявку відхилено')
                    onClose()
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Помилка')
                  }
                }}
                className="rounded-lg bg-rose-900 px-4 py-2 text-sm font-medium text-white hover:bg-rose-800 disabled:opacity-50"
              >
                Відхилити
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
