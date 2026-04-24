import { Skeleton } from '@/components/ui/Skeleton'
import { LightningEventCard } from '@/components/live/LightningEventCard'
import { LightningPortal } from '@/motion/LightningPortal'
import type { BetEventWithOptions } from '@/components/betting/BetEventCard'
import type { Tables } from '@/lib/database.types'

export function LiveStickyPanel({
  isLoading,
  events,
  episodeStatus,
  balance,
  myMap,
}: {
  isLoading: boolean
  events: BetEventWithOptions[] | undefined
  episodeStatus: string
  balance: number
  myMap: Map<string, Tables<'bets'>> | undefined
}) {
  const active = (events ?? []).filter((e) => e.status === 'open' || e.status === 'closed')

  return (
    <LightningPortal>
      <h2 className="font-serif text-xl text-primary-live">Блискавки</h2>
      <p className="mt-1 text-xs text-rose-dust">Швидкі ставки під час ефіру.</p>
      {isLoading ? <Skeleton className="mt-4 h-24 w-full" /> : null}
      {!isLoading && active.length === 0 ? (
        <p className="mt-4 text-sm text-rose-dust">Наразі немає активних блискавок.</p>
      ) : null}
      {!isLoading && active.length > 0 ? (
        <div className="mt-4 space-y-4">
          {active.map((ev) => (
            <LightningEventCard
              key={ev.id}
              ev={ev}
              episodeStatus={episodeStatus}
              balance={balance}
              myBet={myMap?.get(ev.id) ?? null}
            />
          ))}
        </div>
      ) : null}
    </LightningPortal>
  )
}
