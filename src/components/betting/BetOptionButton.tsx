import { useId, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import type { Tables } from '@/lib/database.types'

type Opt = Tables<'bet_options'>

type Ripple = { id: number; x: number; y: number }

export function BetOptionButton({
  option,
  selected,
  onSelect,
  disabled,
}: {
  option: Opt
  selected: boolean
  onSelect: () => void
  disabled?: boolean
}) {
  const reduced = !!useReducedMotion()
  const id = useId()
  const nextRipple = useRef(0)
  const [ripples, setRipples] = useState<Ripple[]>([])

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || reduced) return
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const rid = nextRipple.current++
    setRipples((prev) => [...prev, { id: rid, x, y }])
  }

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      onPointerDown={onPointerDown}
      whileTap={reduced || disabled ? undefined : { scale: 0.985 }}
      className={`relative w-full overflow-hidden rounded-xl border px-4 py-3 text-left transition ${
        selected
          ? 'border-primary-live bg-primary/10 text-rose-cream'
          : 'border-white/10 bg-bg-elevated/40 text-rose-dust hover:border-white/20'
      } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      {ripples.map((r) => (
        <span
          key={`${id}-${r.id}`}
          className="pointer-events-none absolute size-8 animate-[bet-ripple_0.55s_ease-out_forwards] rounded-full bg-primary-live/30"
          style={{ left: r.x - 16, top: r.y - 16 }}
          onAnimationEnd={() => setRipples((prev) => prev.filter((x) => x.id !== r.id))}
        />
      ))}
      <span className="relative z-[1] font-medium text-rose-cream">{option.custom_label}</span>
      <span className="relative z-[1] ml-2 font-mono text-primary-live">
        ×{Number(option.odds).toFixed(2)}
      </span>
    </motion.button>
  )
}
