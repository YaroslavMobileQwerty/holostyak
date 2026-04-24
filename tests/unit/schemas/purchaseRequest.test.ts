import { describe, it, expect } from 'vitest'
import { purchaseRequestSchema } from '@/lib/schemas/purchaseRequest'

describe('purchaseRequestSchema', () => {
  it('rejects file over 5MB', () => {
    const f = new File([new ArrayBuffer(6_000_000)], 'x.jpg', { type: 'image/jpeg' })
    const r = purchaseRequestSchema.safeParse({ amount: 100, userComment: '', screenshot: f })
    expect(r.success).toBe(false)
  })

  it('accepts valid payload', () => {
    const f = new File([new ArrayBuffer(100)], 'x.jpg', { type: 'image/jpeg' })
    const r = purchaseRequestSchema.safeParse({ amount: 50, userComment: 'hi', screenshot: f })
    expect(r.success).toBe(true)
  })
})
