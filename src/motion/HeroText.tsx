import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { ShimmerText } from '@/motion/ShimmerOverlay'

const LINE1 = 'Зроби свою ставку.'

export function HeroText({ reducedMotion }: { reducedMotion: boolean }) {
  const rootRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (reducedMotion || !rootRef.current) return
    const words = rootRef.current.querySelectorAll<HTMLElement>('[data-word]')
    const tl = gsap.timeline({ defaults: { duration: 0.45, ease: 'power2.out' } })
    tl.from(words, { opacity: 0, y: 12, stagger: 0.1 })
    return () => {
      tl.kill()
    }
  }, [reducedMotion])

  const wordsLine1 = LINE1.split(' ').map((w, i) => (
    <span key={`${i}-${w}`} data-word className="inline-block whitespace-nowrap">
      {w}&nbsp;
    </span>
  ))

  return (
    <h1 ref={rootRef} className="font-serif text-5xl leading-none md:text-7xl">
      {reducedMotion ? (
        <>
          {LINE1} <br />
          <em className="text-primary-live">На кохання.</em>
        </>
      ) : (
        <>
          {wordsLine1}
          <br />
          <em className="not-italic">
            <ShimmerText className="font-serif text-5xl md:text-7xl">На кохання.</ShimmerText>
          </em>
        </>
      )}
    </h1>
  )
}
