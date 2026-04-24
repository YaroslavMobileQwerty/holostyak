import { Howl } from 'howler'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SoundContext } from '@/sound/soundContext'
import { SOUNDS, type SoundId } from '@/sound/sounds'

const STORAGE_KEY = 'holostyak-sound-muted'

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const howlsRef = useRef<Partial<Record<SoundId, Howl>>>({})
  const unlockedRef = useRef(false)
  const [muted, setMutedState] = useState(() => {
    if (typeof window === 'undefined') return true
    if (prefersReducedMotion()) return true
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === '0') return false
    if (v === '1') return true
    return true
  })

  const setMuted = useCallback((v: boolean) => {
    setMutedState(v)
    try {
      localStorage.setItem(STORAGE_KEY, v ? '1' : '0')
    } catch {
      /* ignore */
    }
    Howler.mute(v)
  }, [])

  useEffect(() => {
    Howler.mute(muted)
  }, [muted])

  const ensureHowls = useCallback(() => {
    if (howlsRef.current.bet_placed) return
    for (const id of Object.keys(SOUNDS) as SoundId[]) {
      const src = SOUNDS[id]
      howlsRef.current[id] = new Howl({
        src: [src],
        preload: true,
        volume: 0.45,
        onloaderror: (_id, err) => console.warn('[sound]', id, err),
      })
    }
  }, [])

  useEffect(() => {
    const unlock = () => {
      if (unlockedRef.current) return
      unlockedRef.current = true
      ensureHowls()
    }
    document.addEventListener('pointerdown', unlock, { once: true })
    document.addEventListener('keydown', unlock, { once: true })
    return () => {
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [ensureHowls])

  const play = useCallback(
    (id: SoundId) => {
      if (muted) return
      ensureHowls()
      const h = howlsRef.current[id]
      if (h) void h.play()
    },
    [ensureHowls, muted],
  )

  const value = useMemo(() => ({ muted, setMuted, play }), [muted, setMuted, play])

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
