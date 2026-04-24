import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cardLiftProps } from '@/motion/variants'
import type { Tables } from '@/lib/database.types'
import { useAuth } from '@/hooks/useAuth'
import { BetCountdown } from '@/components/betting/BetCountdown'
import { BetOptionButton } from '@/components/betting/BetOptionButton'
import { ResolvingBadge } from '@/components/betting/ResolvingBadge'
import { MyBetChip } from '@/components/betting/MyBetChip'
import { PlaceBetModal } from '@/components/betting/PlaceBetModal'

export type BetEventWithOptions = Tables<'bet_events'> & {
  bet_options: Tables<'bet_options'>[] | null
}

export function BetEventCard({
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
  const { isAuthenticated } = useAuth()
  const reduced = !!useReducedMotion()
  const lift = cardLiftProps(reduced)
  const [open, setOpen] = useState(false)
  const [opt, setOpt] = useState<Tables<'bet_options'> | null>(null)
  const options = [...(ev.bet_options ?? [])].sort((a, b) => a.order_index - b.order_index)
  const episodeOk = episodeStatus === 'open' || episodeStatus === 'live'
  const canBet =
    isAuthenticated && episodeOk && ev.status === 'open' && myBet == null

  const tryOpenBet = (o: Tables<'bet_options'>) => {
    if (!canBet) return
    if (balance <= 0) {
      toast.error('Поповнити бали', {
        description: 'Перейдіть на сторінку донатів, щоб отримати бали.',
        action: {
          label: 'Донат',
          onClick: () => {
            window.location.href = '/coins'
          },
        },
      })
      return
    }
    setOpt(o)
    setOpen(true)
  }

  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-bg-card/80 p-5"
      {...lift}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-serif text-xl text-rose-cream">{ev.title}</h3>
          {ev.description ? (
            <p className="mt-1 text-sm text-rose-dust/80">{ev.description}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-end gap-1 text-right text-xs text-rose-dust">
          {ev.status === 'closed' ? <ResolvingBadge /> : null}
          {ev.status === 'resolved' || ev.status === 'void' ? (
            <span className="text-rose-dust">Статус: {ev.status}</span>
          ) : null}
        </div>
      </div>
      <div className="mt-3 text-sm">
        <BetCountdown closesAt={ev.closes_at} />
      </div>
      {myBet ? (
        <div className="mt-3">
          <MyBetChip bet={myBet} />
        </div>
      ) : null}
      <div className="mt-4 space-y-2">
        {options.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-2">
            <div className="min-w-0 flex-1">
              <BetOptionButton
                option={o}
                selected={opt?.id === o.id}
                onSelect={() => setOpt(o)}
                disabled={!canBet}
              />
            </div>
            {canBet ? (
              <button
                type="button"
                onClick={() => tryOpenBet(o)}
                className="shrink-0 rounded-lg bg-primary/90 px-3 py-2 text-sm text-white"
              >
                Ставити
              </button>
            ) : null}
          </div>
        ))}
      </div>
      {!isAuthenticated ? (
        <p className="mt-3 text-sm text-rose-dust">
          <Link to="/login" className="text-primary-live">
            Увійдіть
          </Link>
          , щоб зробити ставку.
        </p>
      ) : null}
      {isAuthenticated && !episodeOk && ev.status === 'open' ? (
        <p className="mt-2 text-sm text-rose-dust">Випуск ще не відкритий для ставок.</p>
      ) : null}
      {opt && open ? (
        <PlaceBetModal
          open
          onClose={() => {
            setOpen(false)
            setOpt(null)
          }}
          eventId={ev.id}
          eventTitle={ev.title}
          option={opt}
          balance={balance}
          maxBetAmount={ev.max_bet_amount}
        />
      ) : null}
    </motion.div>
  )
}
