import { BetEventCard, type BetEventWithOptions } from '@/components/betting/BetEventCard'
import type { Tables } from '@/lib/database.types'

export function LightningEventCard({
  ev,
  episodeStatus,
  balance,
  myBet,
}: {
  ev: BetEventWithOptions
  episodeStatus: string
  balance: number
  myBet: Tables<'bets'> | null
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-bg-card/90">
      <BetEventCard ev={ev} episodeStatus={episodeStatus} balance={balance} myBet={myBet} />
    </div>
  )
}
