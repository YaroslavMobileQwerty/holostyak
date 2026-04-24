import { createContext } from 'react'
import type { SoundId } from '@/sound/sounds'

export type SoundContextValue = {
  muted: boolean
  setMuted: (v: boolean) => void
  play: (id: SoundId) => void
}

export const SoundContext = createContext<SoundContextValue | null>(null)
