import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAdminBroadcastLog, useAdminBroadcastPreview, useAdminBroadcastSend } from '@/hooks/admin/useAdminBroadcast'
import { useAdminSeasons } from '@/hooks/admin/useAdminCatalog'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Json } from '@/lib/database.types'

export function AdminBroadcastPage() {
  const { data: seasons } = useAdminSeasons()
  const { data: log, isLoading: logLoading, refetch } = useAdminBroadcastLog()
  const preview = useAdminBroadcastPreview()
  const send = useAdminBroadcastSend()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [all, setAll] = useState(false)
  const [activeB, setActiveB] = useState(false)
  const [part, setPart] = useState(false)
  const [seasonId, setSeasonId] = useState('')

  const filter = useMemo((): Json => {
    return {
      all,
      active_bettors: activeB,
      participated: part,
      season_id: seasonId || null,
    } as unknown as Json
  }, [all, activeB, part, seasonId])

  const hasFilter = all || activeB || (part && seasonId.length > 0)
  const canCount = hasFilter
  const canSend = hasFilter && title.trim().length > 0 && body.trim().length > 0

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Розсилка</h1>
      <p className="mt-1 text-sm text-rose-dust">Не більше однієї розсилки на годину (глобально).</p>
      <div className="mt-6 max-w-lg space-y-3 rounded-xl border border-white/10 p-4">
        <label className="text-xs text-rose-dust">Заголовок</label>
        <input
          className="w-full rounded border border-white/15 bg-bg-base px-3 py-2 text-rose-cream"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label className="text-xs text-rose-dust">Текст</label>
        <textarea
          className="w-full rounded border border-white/15 bg-bg-base px-3 py-2 text-rose-cream"
          rows={4}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="space-y-1 text-sm text-rose-cream">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} />
            Усі не заблоковані
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activeB}
              onChange={(e) => setActiveB(e.target.checked)}
            />
            Активні в ставках (24h)
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={part} onChange={(e) => setPart(e.target.checked)} />
            Сезон: учасники зі ставками
          </label>
          {part && (
            <select
              className="ml-4 rounded border border-white/15 bg-bg-base px-2 py-1"
              value={seasonId}
              onChange={(e) => setSeasonId(e.target.value)}
            >
              <option value="">— сезон —</option>
              {(seasons ?? []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} (№{s.number})
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-white/20 px-4 py-2 text-sm"
            disabled={!canCount || preview.isPending}
            onClick={async () => {
              if (!all && !activeB && !(part && seasonId)) {
                toast.error('Оберіть хоча б один фільтр')
                return
              }
              if (part && !seasonId) {
                toast.error('Сезон для «учасників зі ставками»')
                return
              }
              try {
                const n = await preview.mutateAsync(filter)
                toast.success(`Очікувані отримувачі: ${n}`)
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Помилка')
              }
            }}
          >
            Порахувати
          </button>
          <button
            type="button"
            className="rounded bg-primary px-4 py-2 text-sm text-white"
            disabled={!canSend || send.isPending}
            onClick={async () => {
              if (!all && !activeB && !(part && seasonId)) {
                toast.error('Оберіть фільтр')
                return
              }
              if (part && !seasonId) {
                toast.error('Сезон обовʼязковий')
                return
              }
              if (!window.confirm('Підтвердити відправку сповіщень?')) return
              try {
                const n = await send.mutateAsync({ title, body, filter })
                await refetch()
                toast.success(`Відправлено: ${n} повідомлень`)
              } catch (e) {
                const msg = e instanceof Error ? e.message : 'Помилка'
                toast.error(msg)
              }
            }}
          >
            Підтвердити
          </button>
        </div>
      </div>
      <h2 className="mt-8 font-serif text-xl text-rose-cream">Історія</h2>
      {logLoading ? <Skeleton className="mt-2 h-20" /> : null}
      <div className="mt-2 space-y-2 text-sm">
        {(log ?? []).map((r) => (
          <div key={r.id} className="rounded border border-white/10 p-2">
            <p className="text-rose-dust">
              {r.created_at} · {r.title} — {r.recipient_count} отрим.
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
