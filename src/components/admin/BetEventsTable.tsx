import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import type { Tables } from '@/lib/database.types'
import { useLockBetEvent } from '@/hooks/admin/useLockBetEvent'
import { useVoidBetEvent } from '@/hooks/admin/useVoidBetEvent'
import { BetOptionsEditor } from '@/components/admin/BetOptionsEditor'

export type BetEventRow = Tables<'bet_events'> & {
  bet_options: Tables<'bet_options'>[] | null
}

export function BetEventsTable({ rows }: { rows: BetEventRow[] }) {
  const lock = useLockBetEvent()
  const voidEv = useVoidBetEvent()
  const [voidId, setVoidId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  return (
    <div className="mt-6 space-y-4">
      {rows.map((ev) => (
        <div key={ev.id} className="rounded-xl border border-white/10 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-rose-cream">{ev.title}</p>
              <p className="text-xs text-rose-dust">
                {ev.status} · закривається {new Date(ev.closes_at).toLocaleString('uk-UA')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ev.status === 'open' ? (
                <button
                  type="button"
                  disabled={lock.isPending}
                  onClick={() =>
                    void lock.mutateAsync(ev.id, {
                      onError: (e) => toast.error(e instanceof Error ? e.message : 'Помилка'),
                      onSuccess: () => toast.success('Приймання закрито'),
                    })
                  }
                  className="rounded border border-amber-200/30 px-2 py-1 text-xs text-amber-100"
                >
                  Закрити прий
                </button>
              ) : null}
              {voidId === ev.id ? (
                <div className="flex flex-col gap-1 text-xs">
                  <input
                    className="rounded border border-white/15 bg-bg-base px-2 py-1"
                    placeholder="Причина скасування"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => void voidEv.mutateAsync(
                        { eventId: ev.id, reason },
                        {
                          onSuccess: () => {
                            toast.success('Скасовано')
                            setVoidId(null)
                            setReason('')
                          },
                          onError: (e) => toast.error(e instanceof Error ? e.message : 'Помилка'),
                        },
                      )}
                      className="rounded bg-rose-500/30 px-2 py-0.5"
                    >
                      Підтвердити void
                    </button>
                    <button type="button" onClick={() => setVoidId(null)} className="text-rose-dust">
                      Скасувати
                    </button>
                  </div>
                </div>
              ) : ev.status !== 'resolved' && ev.status !== 'void' ? (
                <button
                  type="button"
                  onClick={() => setVoidId(ev.id)}
                  className="rounded border border-rose-400/30 px-2 py-1 text-xs text-rose-300"
                >
                  Void
                </button>
              ) : null}
            </div>
          </div>
          <BetOptionsEditor
            eventId={ev.id}
            options={ev.bet_options ?? []}
            hasBets={ev.total_bets > 0}
          />
        </div>
      ))}
      <p className="text-sm text-rose-dust">
        Підсумовування:{' '}
        <Link to="/admin/resolution" className="text-primary-live">
          черга резолву
        </Link>
      </p>
    </div>
  )
}
