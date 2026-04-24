import { useState } from 'react'
import type { Tables } from '@/lib/database.types'
import { useResolveBetEvent } from '@/hooks/admin/useResolveBetEvent'
import { useAchievementsCatalog } from '@/hooks/useAchievementsCatalog'
import { showAchievementUnlockedToast } from '@/components/social/AchievementUnlockedToast'
import { toast } from 'sonner'

function parseNewAchievementCodes(data: unknown): string[] {
  if (!data || typeof data !== 'object') return []
  const raw = (data as Record<string, unknown>).new_achievements
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === 'string')
}

type Ev = Tables<'bet_events'> & { bet_options: Tables<'bet_options'>[] | null }

export function ResolveBetEventModal({
  ev,
  open,
  onClose,
}: {
  ev: Ev
  open: boolean
  onClose: () => void
}) {
  const resolve = useResolveBetEvent()
  const { data: achCatalog = [] } = useAchievementsCatalog()
  const opts = [...(ev.bet_options ?? [])].sort((a, b) => a.order_index - b.order_index)
  const [selected, setSelected] = useState<string[]>([])

  if (!open) return null

  const toggle = (id: string) => {
    if (ev.is_multi_choice) {
      setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
    } else {
      setSelected([id])
    }
  }

  const onSubmit = async () => {
    if (selected.length === 0) {
      toast.error('Оберіть переможця')
      return
    }
    if (!ev.is_multi_choice && selected.length !== 1) {
      toast.error('Потрібен один варіант')
      return
    }
    try {
      const result = await resolve.mutateAsync({ eventId: ev.id, winningOptionIds: selected })
      toast.success('Подію підсумковано')
      const codes = parseNewAchievementCodes(result)
      const byId = new Map(achCatalog.map((a) => [a.id, a]))
      for (const code of codes) {
        const a = byId.get(code)
        showAchievementUnlockedToast(a?.title ?? 'Нове досягнення', a?.description ?? undefined)
      }
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Помилка')
    }
  }

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
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-xl text-rose-cream">Підсумок: {ev.title}</h2>
        <p className="mt-1 text-sm text-rose-dust">Оберіть виграшні опції. Виплати розраховуються за знімками коефіцієнтів у кожної ставці.</p>
        <ul className="mt-4 space-y-2">
          {opts.map((o) => {
            const on = selected.includes(o.id)
            return (
              <li key={o.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 hover:bg-white/5">
                  <input
                    type={ev.is_multi_choice ? 'checkbox' : 'radio'}
                    name="win"
                    checked={on}
                    onChange={() => toggle(o.id)}
                  />
                  <span className="text-rose-cream">
                    {o.custom_label} @ {Number(o.odds).toFixed(2)}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border border-white/15 px-4 py-2 text-sm">
            Скасувати
          </button>
          <button
            type="button"
            disabled={resolve.isPending}
            onClick={() => void onSubmit()}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  )
}
