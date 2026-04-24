import type { Transition, Variants } from 'framer-motion'

const ease: [number, number, number, number] = [0.4, 0, 0.2, 1]

export const pageTransition = {
  duration: 0.4,
  ease,
} satisfies Transition

export function pageTransitionVariants(reducedMotion: boolean): Variants {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.2 } },
      exit: { opacity: 0, transition: { duration: 0.15 } },
    }
  }
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: pageTransition },
    exit: { opacity: 0, y: -20, transition: pageTransition },
  }
}

export function cardLiftProps(reducedMotion: boolean) {
  if (reducedMotion) {
    return {
      whileHover: undefined,
      whileTap: undefined,
      transition: { duration: 0.2 },
    }
  }
  return {
    whileHover: {
      y: -4,
      boxShadow: '0 20px 40px rgba(213,0,50,0.3)',
    },
    transition: { duration: 0.3 },
  }
}
