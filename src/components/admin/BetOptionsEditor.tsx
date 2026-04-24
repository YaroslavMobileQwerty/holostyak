import { useState } from 'react'
import { toast } from 'sonner'
import type { Tables } from '@/lib/database.types'
import { useCreateBetOption } from '@/hooks/admin/useCreateBetOption'
import { useDeleteBetOption } from '@/hooks/admin/useDeleteBetOption'

export function BetOptionsEditor({
  eventId,
  options,
  hasBets,
}: {
  eventId: string
  options: Tables<'bet_options'>[]
  hasBets: boolean
}) {
  const [label, setLabel] = useState('')
  const [odds, setOdds] = useState('2.00')
  const create = useCreateBetOption()
  const del = useDeleteBetOption()
  const sorted = [...options].sort((a, b) => a.order_index - b.order_index)

  const add = async () => {
    if (label.trim().length < 1) {
      toast.error('Вкажіть підпис')
      return
    }
    const o = Number(odds)
    if (Number.isNaN(o) || o < 1.01) {
      toast.error('Коефіцієнт від 1.01')
      return
    }
    try {
      await create.mutateAsync({
        event_id: eventId,
        custom_label: label.trim(),
        participant_id: null,
        odds: o,
        order_index: sorted.length,
      })
      setLabel('')
      setOdds('2.00')
      toast.success('Опцію додано')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Помилка')
    }
  }

  return (
    <div className="mt-2 rounded-lg border border-white/10 p-3">
      <p className="text-sm text-rose-dust">Опції (коефіцієнти {hasBets ? 'заморожені після ставок' : 'можна міняти'})</p>
      <ul className="mt-2 space-y-1 text-sm">
        {sorted.map((o) => (
          <li key={o.id} className="flex items-center justify-between gap-2">
            <span>
              {o.custom_label} — ×{Number(o.odds).toFixed(2)}
            </span>
            <button
              type="button"
              disabled={del.isPending}
              onClick={() => void del.mutateAsync(o.id)}
              className="text-xs text-rose-400 disabled:opacity-50"
            >
              Видалити
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          className="min-w-0 flex-1 rounded border border-white/15 bg-bg-base px-2 py-1 text-sm"
          placeholder="Підпис"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className="w-24 rounded border border-white/15 bg-bg-base px-2 py-1 text-sm"
          placeholder="2.0"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
        />
        <button
          type="button"
          onClick={() => void add()}
          disabled={create.isPending}
          className="rounded bg-primary/90 px-3 py-1 text-sm text-white"
        >
          Додати
        </button>
      </div>
    </div>
  )
}
