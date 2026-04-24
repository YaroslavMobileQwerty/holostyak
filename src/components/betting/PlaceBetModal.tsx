import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { trackPlausible } from '@/analytics/plausible'
import { floorPayout } from '@/lib/betting/payout'
import { usePlaceBet } from '@/hooks/usePlaceBet'
import { useSound } from '@/sound/useSound'
import type { Tables } from '@/lib/database.types'

type Opt = Tables<'bet_options'>

export function PlaceBetModal({
  open,
  onClose,
  eventId,
  eventTitle,
  option,
  balance,
  maxBetAmount,
}: {
  open: boolean
  onClose: () => void
  eventId: string
  eventTitle: string
  option: Opt
  balance: number
  maxBetAmount: number | null
}) {
  const place = usePlaceBet()
  const { play } = useSound()
  const cap = Math.min(balance, maxBetAmount ?? balance)
  const [amount, setAmount] = useState(1)
  const safeAmount = Math.max(1, Math.min(amount, cap || 1))
  const oddsN = Number(option.odds)
  const preview = floorPayout(safeAmount, oddsN)

  if (!open) return null

  if (balance <= 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="w-full max-w-md rounded-2xl border border-white/15 bg-bg-card p-6 shadow-xl"
          role="dialog"
          aria-modal
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-rose-cream">Недостатньо балів для ставки.</p>
          <Link
            to="/coins"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            onClick={onClose}
          >
            Поповнити бали
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async () => {
    if (cap < 1) {
      toast.error('Недостатньо балів')
      return
    }
    try {
      await place.mutateAsync({
        eventId,
        optionId: option.id,
        amount: safeAmount,
      })
      play?.('bet_placed')
      trackPlausible('bet_placed', { props: { amount: safeAmount, odds: oddsN } })
      toast.success('Ставку прийнято')
      onClose()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Помилка ставки'
      toast.error(msg)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/15 bg-bg-card p-6 shadow-xl"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-xl text-rose-cream">Ставка</h2>
        <p className="mt-1 text-sm text-rose-dust">
          {eventTitle} — {option.custom_label} ({oddsN.toFixed(2)})
        </p>
        <div className="mt-6">
          <label className="text-sm text-rose-dust" htmlFor="bet-amt">
            Сума (1–{cap})
          </label>
          <input
            id="bet-amt"
            type="range"
            min={1}
            max={Math.max(1, cap)}
            value={Math.min(safeAmount, cap)}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-2 w-full"
          />
          <p className="mt-2 font-mono text-lg text-rose-cream">{safeAmount} балів</p>
        </div>
        <p className="mt-2 text-sm text-rose-dust">
          Потенційна виплата: <span className="text-primary-live">{preview}</span> балів
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-rose-dust"
          >
            Скасувати
          </button>
          <button
            type="button"
            disabled={place.isPending}
            onClick={() => void onSubmit()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  )
}
