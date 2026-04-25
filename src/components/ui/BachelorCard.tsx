import { useReducedMotion } from 'framer-motion'
import { motion } from 'framer-motion'
import { CinematicArticle } from '@/motion/CinematicCard'

interface Props {
  name: string
  bio?: string | null
  photoUrl?: string | null
  orderIndex: number
}

export function BachelorCard({ name, bio, photoUrl, orderIndex }: Props) {
  const reduced = !!useReducedMotion()
  return (
    <CinematicArticle className="overflow-hidden rounded-2xl border border-primary/20 bg-bg-card">
      <motion.div
        className="aspect-[3/4] bg-gradient-to-br from-burgundy to-bg-elevated"
        style={
          photoUrl
            ? {
                backgroundImage: `url(${photoUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 25%',
              }
            : undefined
        }
        whileHover={reduced ? undefined : { scale: 1.02 }}
        transition={{ duration: 0.3 }}
      />
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-primary-live">
          Холостяк #{orderIndex}
        </p>
        <h3 className="mt-1 font-serif text-2xl">{name}</h3>
        {bio && <p className="mt-2 text-sm text-rose-dust">{bio}</p>}
      </div>
    </CinematicArticle>
  )
}
