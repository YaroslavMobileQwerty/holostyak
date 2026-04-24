import { describe, it, expect } from 'vitest'
import { floorPayout } from '@/lib/betting/payout'

describe('floorPayout', () => {
  it('matches documented rule', () => {
    expect(floorPayout(100, 2.5)).toBe(250)
    expect(floorPayout(100, 2.55)).toBe(255)
    expect(floorPayout(99, 1.01)).toBe(Math.floor(99 * 1.01))
  })
})
