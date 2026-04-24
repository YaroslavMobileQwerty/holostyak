import { describe, expect, it } from 'vitest'
import { pageTransitionVariants } from '@/motion/variants'

describe('pageTransitionVariants', () => {
  it('uses full motion when reducedMotion is false', () => {
    const v = pageTransitionVariants(false)
    expect(v.initial).toEqual({ opacity: 0, y: 20 })
    expect(v.animate).toMatchObject({ opacity: 1, y: 0 })
    expect(v.exit).toMatchObject({ opacity: 0, y: -20 })
  })

  it('uses opacity-only when reducedMotion is true', () => {
    const v = pageTransitionVariants(true)
    expect(v.initial).toEqual({ opacity: 0 })
    expect(v.animate).toMatchObject({
      opacity: 1,
      transition: { duration: expect.any(Number) },
    })
    expect(v.exit).toMatchObject({ opacity: 0 })
  })
})
