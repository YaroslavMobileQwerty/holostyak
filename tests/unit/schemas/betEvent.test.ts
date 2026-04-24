import { describe, it, expect } from 'vitest'
import { betEventSchema } from '@/lib/schemas/betEvent'

describe('betEventSchema', () => {
  it('accepts minimal valid payload', () => {
    const r = betEventSchema.safeParse({
      episodeId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'custom',
      title: 'Хто піде додому?',
      closesAt: '2026-05-01T20:00:00.000Z',
    })
    expect(r.success).toBe(true)
  })

  it('rejects short title', () => {
    const r = betEventSchema.safeParse({
      episodeId: '550e8400-e29b-41d4-a716-446655440000',
      type: 'custom',
      title: 'ab',
      closesAt: '2026-05-01T20:00:00.000Z',
    })
    expect(r.success).toBe(false)
  })
})
