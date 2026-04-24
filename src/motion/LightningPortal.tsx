import { motion, useReducedMotion } from 'framer-motion'

export function LightningPortal({ children }: { children: React.ReactNode }) {
  const reduced = !!useReducedMotion()
  return (
    <motion.aside
      id="lightning-panel"
      initial={reduced ? { opacity: 0 } : { y: '100%', opacity: 0, scale: 0.8 }}
      animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
      transition={
        reduced ? { duration: 0.2 } : { type: 'spring', stiffness: 300, damping: 25 }
      }
      className="fixed bottom-0 left-0 right-0 z-40 max-h-[42vh] overflow-y-auto border-t border-primary/25 bg-bg-card/95 p-4 backdrop-blur lg:bottom-auto lg:left-auto lg:right-4 lg:top-24 lg:mt-8 lg:max-h-[calc(100vh-8rem)] lg:w-80 lg:rounded-2xl lg:border lg:border-primary/25 lg:bg-bg-card/90 lg:p-4 lg:shadow-lg"
    >
      {children}
    </motion.aside>
  )
}
