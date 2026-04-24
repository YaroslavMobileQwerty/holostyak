import { describe, expect, it } from 'vitest'
import { decidePollingIntervalMs } from '@/hooks/realtime/livePolling'

describe('decidePollingIntervalMs', () => {
  it('returns 0 when websocket is healthy', () => {
    expect(decidePollingIntervalMs(true, false)).toBe(0)
    expect(decidePollingIntervalMs(false, false)).toBe(0)
  })

  it('uses 10s interval for live episodes when ws failed', () => {
    expect(decidePollingIntervalMs(true, true)).toBe(10_000)
  })

  it('uses 30s interval for non-live when ws failed', () => {
    expect(decidePollingIntervalMs(false, true)).toBe(30_000)
  })
})
