import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/Skeleton'
import { useAnimatedBalance } from '@/hooks/useAnimatedBalance'

export function BalanceCard({
  balance,
  isLoading,
}: {
  balance: number | undefined
  isLoading: boolean
}) {
  const { display, delta } = useAnimatedBalance(balance)

  if (isLoading)
    return (
      <div className="rounded-2xl border border-white/10 bg-bg-card p-8">
        <Skeleton className="h-10 w-48" />
      </div>
    )

  return (
    <section className="relative rounded-2xl border border-primary/25 bg-bg-card p-8">
      <p className="text-xs uppercase tracking-[0.3em] text-primary-live">Баланс балів</p>
      <p className="mt-2 font-mono text-5xl text-rose-cream">{display}</p>
      <AnimatePresence>
        {delta != null && delta > 0 ? (
          <motion.span
            key={delta}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute left-8 top-8 font-mono text-lg text-primary-live"
          >
            +{delta}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <Link
        to="/coins"
        className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hot"
      >
        Поповнити
      </Link>
    </section>
  )
}
