import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import type { Tables } from '@/lib/database.types'

const LABEL: Record<string, string> = {
  pending: 'Активна',
  won: 'Виграш',
  lost: 'Програш',
  void: 'Скасовано',
}

export function MyBetChip({ bet }: { bet: Tables<'bets'> }) {
  const reduced = !!useReducedMotion()
  const won = bet.status === 'won'
  const lost = bet.status === 'lost'

  return (
    <motion.span
      initial={false}
      animate={
        reduced
          ? undefined
          : won
            ? { rotateY: [0, 180, 360] }
            : lost
              ? { x: [0, -2, 2, -2, 2, 0] }
              : undefined
      }
      transition={
        won ? { duration: 0.65, ease: 'easeInOut' } : lost ? { duration: 0.4 } : undefined
      }
      className={`relative inline-block rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-xs text-rose-cream ${
        lost ? 'opacity-50' : ''
      }`}
    >
      {LABEL[bet.status] ?? bet.status} · {bet.amount} → {bet.potential_payout} б.
      {won && (bet.payout ?? 0) > 0 ? (
        <span className="ml-1 font-mono text-primary-live">+{bet.payout} б.</span>
      ) : null}
    </motion.span>
  )
}
