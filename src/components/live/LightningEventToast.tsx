import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'
import { useSound } from '@/sound/useSound'

export function LightningEventToast({
  title,
  closesAt,
  onOpenBet,
  onDismiss,
}: {
  title: string
  closesAt: string
  onOpenBet: () => void
  onDismiss: () => void
}) {
  const { play } = useSound()
  const [left, setLeft] = useState(() =>
    Math.max(0, differenceInSeconds(new Date(closesAt), new Date())),
  )

  useEffect(() => {
    play?.('lightning')
  }, [play])

  useEffect(() => {
    const t = window.setInterval(() => {
      setLeft(Math.max(0, differenceInSeconds(new Date(closesAt), new Date())))
    }, 1000)
    return () => clearInterval(t)
  }, [closesAt])

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-primary/30 bg-bg-card/95 p-4 shadow-xl backdrop-blur md:left-auto md:right-4"
    >
      <p className="font-serif text-lg text-rose-cream">Нова блискавка</p>
      <p className="mt-1 text-sm text-rose-dust">{title}</p>
      <p className="mt-2 font-mono text-xs text-primary-live">Закриття прийому: {left}s</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onOpenBet}
          className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
        >
          До ставки
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-rose-dust"
        >
          Пізніше
        </button>
      </div>
    </div>
  )
}
