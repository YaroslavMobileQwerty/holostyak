import { useReducedMotion } from 'framer-motion'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'
import { pageTransitionVariants } from '@/motion/variants'

export function PageTransition() {
  const location = useLocation()
  const reduced = !!useReducedMotion()
  const variants = pageTransitionVariants(reduced)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        className="contents"
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
