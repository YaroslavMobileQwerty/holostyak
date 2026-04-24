import { useState } from 'react'
import { toast } from 'sonner'
import { usePreviewFinalizeQuery, useFinalizeSeason, type PreviewRow } from '@/hooks/admin/useFinalizeSeason'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Tables } from '@/lib/database.types'

function SeasonFinalizeBody({
  season,
  onClose,
}: {
  season: Tables<'seasons'>
  onClose: () => void
}) {
  const { data: previewData, isLoading, error } = usePreviewFinalizeQuery(season.id, true)
  const finalize = useFinalizeSeason()
  const [confirm, setConfirm] = useState('')

  const canSubmit = confirm === 'ФІНАЛ'
  const list: PreviewRow[] = previewData?.preview ?? []

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-rose-500/30 bg-bg-card p-6 shadow-xl"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl text-rose-cream">Фіналізувати сезон {season.number}</h2>
        <p className="mt-1 text-sm text-rose-dust">
          {season.title} — з таблиці буде обрано до трьох найкращих за правилами лідерборду цього сезону.
        </p>

        {isLoading ? <Skeleton className="mt-4 h-24" /> : null}
        {error ? (
          <p className="mt-4 text-sm text-primary-hot">{(error as Error).message}</p>
        ) : null}
        {!isLoading && !error && list.length === 0 ? (
          <p className="mt-4 text-sm text-amber-200">
            Немає гравців зі ставками (won/lost) у цьому сезоні. Фінал неможливий.
          </p>
        ) : null}
        {list.length > 0 ? (
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-rose-cream">
            {list.map((r) => (
              <li key={r.user_id}>
                {r.place_preview}. {r.nickname ?? '—'} — виграш сезону: {r.season_total_won} бал
              </li>
            ))}
          </ol>
        ) : null}

        <div className="mt-4">
          <label className="text-xs text-rose-dust">Набери слово «ФІНАЛ», щоб підтвердити</label>
          <input
            className="mt-1 w-full rounded border border-white/20 bg-bg-base px-3 py-2 font-mono text-rose-cream"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className="rounded border border-white/20 px-4 py-2" onClick={onClose}>
            Скасувати
          </button>
          <button
            type="button"
            disabled={!canSubmit || finalize.isPending || list.length === 0}
            className="rounded bg-rose-600 px-4 py-2 text-white disabled:opacity-50"
            onClick={async () => {
              try {
                await finalize.mutateAsync({ seasonId: season.id, force: false })
                toast.success('Сезон фіналізовано, призи створено')
                onClose()
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Помилка')
              }
            }}
          >
            {finalize.isPending ? 'Виконання…' : 'Запустити фіналізацію'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SeasonFinalizeModal({
  season,
  open,
  onClose,
}: {
  season: Tables<'seasons'> | null
  open: boolean
  onClose: () => void
}) {
  if (!open || !season) return null
  return <SeasonFinalizeBody key={season.id} season={season} onClose={onClose} />
}
