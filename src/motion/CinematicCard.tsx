import type { ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import { Link, type LinkProps } from 'react-router-dom'
import { cardLiftProps } from '@/motion/variants'

export function CinematicArticle({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const reduced = !!useReducedMotion()
  const lift = cardLiftProps(reduced)
  return (
    <motion.article className={className} {...lift}>
      {children}
    </motion.article>
  )
}

/** Lift hover on a block link without `motion(Link)` typing edge cases. */
export function CinematicLink(props: LinkProps & { className?: string; children?: ReactNode }) {
  const reduced = !!useReducedMotion()
  const lift = cardLiftProps(reduced)
  const { className, children, ...rest } = props
  return (
    <motion.div {...lift} className="block rounded-2xl">
      <Link {...rest} className={`block ${className ?? ''}`}>
        {children}
      </Link>
    </motion.div>
  )
}
