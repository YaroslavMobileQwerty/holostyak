import { describe, expect, it } from 'vitest'
import { exportUsersCsv } from '@/lib/exportUsersCsv'

const row = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  nickname: 'test, "nick"',
  email: 'a@b.c',
  role: 'user',
  is_banned: false,
  balance: 10,
  total_bets: 2,
  correct_bets: 1,
  created_at: '2026-01-01T00:00:00.000Z',
}

describe('exportUsersCsv', () => {
  it('includes header and rows', () => {
    const csv = exportUsersCsv([row])
    expect(csv).toMatch(/^id,nickname,email/)
    expect(csv).toContain('550e8400-e29b-41d4-a716-446655440000')
  })

  it('escapes commas and quotes in nickname', () => {
    const csv = exportUsersCsv([row])
    expect(csv).toContain('"test, ""nick"""')
  })
})
