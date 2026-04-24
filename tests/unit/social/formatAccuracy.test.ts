import { describe, expect, it } from 'vitest'
import { formatAccuracy } from '@/lib/formatAccuracy'

describe('formatAccuracy', () => {
  it('returns em dash when total <= 0', () => {
    expect(formatAccuracy(0, 0)).toBe('—')
    expect(formatAccuracy(3, 0)).toBe('—')
  })

  it('rounds to one decimal', () => {
    expect(formatAccuracy(1, 2)).toBe('50%')
    expect(formatAccuracy(3, 10)).toBe('30%')
  })
})
