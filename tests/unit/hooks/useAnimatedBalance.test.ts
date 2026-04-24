import { describe, expect, it } from 'vitest'
import { lerpInt } from '@/hooks/useAnimatedBalance'

describe('lerpInt', () => {
  it('interpolates toward target', () => {
    expect(lerpInt(0, 100, 0.5)).toBe(50)
    expect(lerpInt(100, 0, 1)).toBe(0)
  })
})
