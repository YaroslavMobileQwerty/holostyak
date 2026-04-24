import { useState } from 'react'
import { toast } from 'sonner'
import { useAdminBetEventsForResolution } from '@/hooks/admin/useAdminBetEventsForResolution'
import { useAutoLockBetEvents } from '@/hooks/admin/useAutoLockBetEvents'
import { useLockBetEvent } from '@/hooks/admin/useLockBetEvent'
import { ResolveBetEventModal } from '@/components/admin/ResolveBetEventModal'
import { Skeleton } from '@/components/ui/Skeleton'
import type { BetEventRow } from '@/components/admin/BetEventsTable'

export function AdminResolutionPage() {
  const { data, isLoading, refetch } = useAdminBetEventsForResolution()
  const autoLock = useAutoLockBetEvents()
  const lock = useLockBetEvent()
  const [resolveEv, setResolveEv] = useState<BetEventRow | null>(null)

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Черга резолву</h1>
      <p className="mt-2 text-sm text-rose-dust">
        Події зі статусом «закрито» після дедлайну, або відкриті з простроченим часом. Резолв — лише для закритих
        подій.
      </p>
      <button
        type="button"
        className="mt-4 rounded-lg border border-white/20 px-4 py-2 text-sm text-rose-cream"
        disabled={autoLock.isPending}
        onClick={() =>
          void autoLock.mutateAsync(undefined, {
            onSuccess: (n) => {
              toast.success(`Автозакрито подій: ${n}`)
              void refetch()
            },
            onError: (e) => toast.error(e instanceof Error ? e.message : 'Помилка'),
          })
        }
      >
        Auto-lock прострочених
      </button>
      {isLoading ? <Skeleton className="mt-6 h-64" /> : null}
      <ul className="mt-6 space-y-3">
        {data?.map((ev) => {
          const row = ev as BetEventRow
          return (
            <li key={ev.id} className="rounded-xl border border-white/10 p-4">
              <p className="font-medium text-rose-cream">{ev.title}</p>
              <p className="text-xs text-rose-dust">
                {ev.status} · {new Date(ev.closes_at).toLocaleString('uk-UA')}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ev.status === 'open' && new Date(ev.closes_at) <= new Date() ? (
                  <button
                    type="button"
                    disabled={lock.isPending}
                    onClick={() =>
                      void lock.mutateAsync(ev.id, {
                        onSuccess: () => {
                          toast.success('Закрито')
                          void refetch()
                        },
                        onError: (e) => toast.error(e instanceof Error ? e.message : 'Помилка'),
                      })
                    }
                    className="rounded bg-amber-500/20 px-2 py-1 text-xs"
                  >
                    Закрити прий
                  </button>
                ) : null}
                {ev.status === 'closed' ? (
                  <button
                    type="button"
                    onClick={() => setResolveEv(row)}
                    className="rounded bg-primary/30 px-2 py-1 text-xs text-rose-cream"
                  >
                    Підсумувати
                  </button>
                ) : null}
              </div>
            </li>
          )
        })}
      </ul>
      {resolveEv ? (
        <ResolveBetEventModal
          ev={resolveEv}
          open
          onClose={() => {
            setResolveEv(null)
            void refetch()
          }}
        />
      ) : null}
    </div>
  )
}
