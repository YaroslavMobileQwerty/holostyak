import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useActiveSeason } from '@/hooks/useActiveSeason'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}))

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useActiveSeason', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns active season', async () => {
    const mockMaybeSingle = vi.fn().mockResolvedValue({
      data: { id: 's1', number: 15, title: 'Холостяк 15', status: 'active' },
      error: null,
    })
    ;(supabase.from as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      select: () => ({ eq: () => ({ maybeSingle: mockMaybeSingle }) }),
    })

    const { result } = renderHook(() => useActiveSeason(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.number).toBe(15)
  })
})
