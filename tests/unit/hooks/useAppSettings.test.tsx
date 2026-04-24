import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useAppSettings } from '@/hooks/useAppSettings'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useAppSettings', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns key-value record', async () => {
    ;(supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      select: () =>
        Promise.resolve({
          data: [
            { key: 'donation_jar_url', value: '"https://example.com"' },
            { key: 'bet_close_minutes', value: 60 },
          ],
          error: null,
        }),
    })

    const { result } = renderHook(() => useAppSettings(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.donation_jar_url).toBe('"https://example.com"')
    expect(result.current.data?.bet_close_minutes).toBe(60)
  })
})
