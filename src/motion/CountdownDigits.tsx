import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

function DigitCol({ value, label }: { value: string; label: string }) {
  const reduced = !!useReducedMotion()
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-wider text-rose-dust/80">{label}</span>
      <div className="relative h-8 min-w-[2ch] overflow-hidden font-mono text-lg tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={value}
            initial={reduced ? false : { y: 16, opacity: 0 }}
            animate={reduced ? undefined : { y: 0, opacity: 1 }}
            exit={reduced ? undefined : { y: -16, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  )
}

export function CountdownDigits({ closesAt, now }: { closesAt: string; now: number }) {
  const end = new Date(closesAt).getTime()
  const left = Math.max(0, end - now)
  const totalSec = Math.floor(left / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return (
    <div className="flex items-end gap-3">
      <DigitCol value={pad(h)} label="год" />
      <DigitCol value={pad(m)} label="хв" />
      <DigitCol value={pad(s)} label="сек" />
    </div>
  )
}
