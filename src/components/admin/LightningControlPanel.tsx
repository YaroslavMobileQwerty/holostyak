import { useState } from 'react'
import { toast } from 'sonner'
import { useLightningEvents } from '@/hooks/useLightningEvents'
import {
  useCreateLightningEvent,
  type LightningOptionInput,
} from '@/hooks/admin/useCreateLightningEvent'
import { useQuickResolveLightning } from '@/hooks/admin/useQuickResolveLightning'
import type { BetEventWithOptions } from '@/components/betting/BetEventCard'

const PRESETS = [60, 120, 180] as const

function sortOptions(ev: BetEventWithOptions) {
  return [...(ev.bet_options ?? [])].sort((a, b) => a.order_index - b.order_index)
}

export function LightningControlPanel({ episodeId }: { episodeId: string }) {
  const { data: events, isLoading } = useLightningEvents(episodeId, {
    refetchIntervalMs: 12_000,
  })
  const createMut = useCreateLightningEvent()
  const resolveMut = useQuickResolveLightning()

  const [title, setTitle] = useState('')
  const [lockSec, setLockSec] = useState(120)
  const [rows, setRows] = useState<{ label: string; odds: string }[]>([
    { label: 'Так', odds: '2' },
    { label: 'Ні', odds: '2' },
  ])
  const [pick, setPick] = useState<Record<string, string>>({})

  const addRow = () => setRows((r) => [...r, { label: '', odds: '2' }])
  const active = (events ?? []).filter((e) => e.status === 'open' || e.status === 'closed')
  const history = (events ?? []).filter((e) => e.status === 'resolved' || e.status === 'void')

  const submitCreate = async () => {
    if (!title.trim()) {
      toast.error('Вкажіть назву')
      return
    }
    const options: LightningOptionInput[] = []
    for (const row of rows) {
      const odds = Number(row.odds)
      if (!row.label.trim() || Number.isNaN(odds)) {
        toast.error('Перевірте назви опцій та коефіцієнти')
        return
      }
      options.push({ custom_label: row.label.trim(), odds, participant_id: null })
    }
    if (options.length < 2) {
      toast.error('Потрібно щонайменше 2 опції')
      return
    }
    try {
      await createMut.mutateAsync({
        episodeId,
        title: title.trim(),
        lockTimeSeconds: lockSec,
        options,
      })
      toast.success('Блискавку створено')
      setTitle('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Помилка')
    }
  }

  const submitResolve = async (ev: BetEventWithOptions) => {
    const win = pick[ev.id]
    if (!win) {
      toast.error('Оберіть переможну опцію')
      return
    }
    try {
      await resolveMut.mutateAsync({
        eventId: ev.id,
        winningOptionId: win,
        episodeId,
      })
      toast.success('Підсумок зафіксовано')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Помилка')
    }
  }

  return (
    <div className="mt-8 space-y-10">
      <section className="rounded-2xl border border-white/10 bg-bg-card/80 p-6">
        <h2 className="font-serif text-xl text-rose-cream">Нова блискавка</h2>
        <p className="mt-1 text-sm text-rose-dust">Лише коли випуск у статусі live.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setLockSec(s)}
              className={`rounded-lg px-3 py-1 text-sm ${
                lockSec === s ? 'bg-primary text-white' : 'border border-white/15 text-rose-dust'
              }`}
            >
              {s} с
            </button>
          ))}
        </div>
        <label className="mt-4 block text-sm text-rose-dust">
          Назва
          <input
            className="mt-1 w-full rounded-lg border border-white/15 bg-bg-base px-3 py-2 text-rose-cream"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <div className="mt-4 space-y-2">
          <p className="text-sm text-rose-dust">Опції (мін. 2)</p>
          {rows.map((row, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                placeholder="Підпис"
                className="min-w-[8rem] flex-1 rounded-lg border border-white/15 bg-bg-base px-3 py-2 text-sm text-rose-cream"
                value={row.label}
                onChange={(e) =>
                  setRows((rs) => rs.map((r, j) => (j === i ? { ...r, label: e.target.value } : r)))
                }
              />
              <input
                placeholder="Коеф."
                className="w-24 rounded-lg border border-white/15 bg-bg-base px-3 py-2 text-sm text-rose-cream"
                value={row.odds}
                onChange={(e) =>
                  setRows((rs) => rs.map((r, j) => (j === i ? { ...r, odds: e.target.value } : r)))
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="text-sm text-primary-live underline-offset-4 hover:underline"
          >
            + опція
          </button>
        </div>
        <button
          type="button"
          disabled={createMut.isPending}
          onClick={() => void submitCreate()}
          className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          Опублікувати блискавку
        </button>
      </section>

      <section>
        <h2 className="font-serif text-xl text-rose-cream">Активні</h2>
        {isLoading ? <p className="mt-2 text-sm text-rose-dust">Завантаження…</p> : null}
        {!isLoading && active.length === 0 ? (
          <p className="mt-2 text-sm text-rose-dust">Немає відкритих блискавок.</p>
        ) : null}
        <ul className="mt-4 space-y-4">
          {active.map((ev) => (
            <li key={ev.id} className="rounded-xl border border-white/10 bg-bg-card/60 p-4">
              <p className="font-medium text-rose-cream">{ev.title}</p>
              <p className="text-xs text-rose-dust">
                {ev.status} · закриття {new Date(ev.closes_at).toLocaleString('uk-UA')}
              </p>
              <div className="mt-3 space-y-2">
                {sortOptions(ev as BetEventWithOptions).map((o) => (
                  <label key={o.id} className="flex items-center gap-2 text-sm text-rose-dust">
                    <input
                      type="radio"
                      name={`win-${ev.id}`}
                      checked={pick[ev.id] === o.id}
                      onChange={() => setPick((p) => ({ ...p, [ev.id]: o.id }))}
                    />
                    {o.custom_label} ({o.odds})
                  </label>
                ))}
              </div>
              <button
                type="button"
                disabled={resolveMut.isPending}
                onClick={() => void submitResolve(ev as BetEventWithOptions)}
                className="mt-3 rounded-lg border border-primary/40 px-3 py-1 text-sm text-primary-live disabled:opacity-50"
              >
                Підсумок
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-serif text-xl text-rose-cream">Історія</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-rose-dust">Поки порожньо.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm text-rose-dust">
            {history.map((ev) => (
              <li key={ev.id}>
                {ev.title} — {ev.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
