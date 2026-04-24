import { motion, AnimatePresence } from 'framer-motion'
import type { Tables } from '@/lib/database.types'

type Status = Tables<'season_prizes'>['shipping_status']

export function SecretPrizeRevealCard({
  shippingStatus,
  description,
}: {
  shippingStatus: Status
  description: string | null
}) {
  const show = shippingStatus === 'delivered' && description && description.trim() !== ''
  return (
    <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-bg-base/50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-rose-dust/90">Секретний сюрприз</p>
      <div className="relative mt-2 min-h-[4rem]">
        <AnimatePresence mode="wait">
          {show ? (
            <motion.p
              key="revealed"
              className="text-sm leading-relaxed text-rose-cream"
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
            >
              {description}
            </motion.p>
          ) : (
            <motion.div
              key="hidden"
              className="flex h-full min-h-[4rem] items-center justify-center rounded-lg bg-gradient-to-r from-violet-900/20 to-rose-900/20"
              initial={{ opacity: 0.9 }}
            >
              <p className="text-center text-sm text-rose-dust/90 blur-[1px]">
                <span className="text-2xl" aria-hidden>
                  🎁
                </span>
                <br />
                {shippingStatus === 'delivered' ? 'Опис сюрпризу додадуть адміністратори' : 'Розкриття після доставки'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
