import { useContext } from 'react'
import { SoundContext } from '@/sound/soundContext'
import type { SoundId } from '@/sound/sounds'

export function useSound() {
  const ctx = useContext(SoundContext)
  return {
    play: (id: SoundId) => ctx?.play(id),
    muted: ctx?.muted ?? true,
    setMuted: ctx?.setMuted,
  }
}
