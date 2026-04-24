import * as React from 'react'

export function lerpInt(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * t)
}

export function useAnimatedBalance(current: number | undefined) {
  const [display, setDisplay] = React.useState(current ?? 0)
  const [delta, setDelta] = React.useState<number | null>(null)
  const fromRef = React.useRef(current ?? 0)
  const initialized = React.useRef(false)
  const rafRef = React.useRef<number | null>(null)
  const startRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (current === undefined) return
    if (!initialized.current) {
      initialized.current = true
      fromRef.current = current
      setDisplay(current)
      return
    }
    const from = fromRef.current
    const to = current
    if (to === from) return
    const gained = to > from ? to - from : null
    if (gained && gained > 0) setDelta(gained)
    startRef.current = null
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    const duration = 500
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const t = Math.min(1, elapsed / duration)
      setDisplay(lerpInt(from, to, t))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else {
        fromRef.current = to
        rafRef.current = null
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [current])

  React.useEffect(() => {
    if (delta == null) return
    const id = window.setTimeout(() => setDelta(null), 1500)
    return () => clearTimeout(id)
  }, [delta])

  return { display, delta }
}
