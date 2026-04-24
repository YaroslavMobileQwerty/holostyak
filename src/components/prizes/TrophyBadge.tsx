import { motion } from 'framer-motion'

const styles = {
  1: 'from-amber-200 via-yellow-300 to-amber-500 shadow-amber-500/30',
  2: 'from-slate-200 via-slate-100 to-slate-400 shadow-slate-400/30',
  3: 'from-amber-700/90 via-amber-600 to-orange-800 shadow-amber-700/30',
} as const

const emoji = { 1: '🏆', 2: '🥈', 3: '🥉' } as const

export function TrophyBadge({ place }: { place: 1 | 2 | 3 }) {
  return (
    <motion.div
      className={`
        flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl
        border border-white/20 bg-gradient-to-br text-2xl
        ${styles[place]}
      `}
      whileHover={{ scale: 1.06, rotate: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <span className="drop-shadow-sm">{emoji[place]}</span>
    </motion.div>
  )
}
