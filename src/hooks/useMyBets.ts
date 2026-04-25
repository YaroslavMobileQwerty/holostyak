import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { getDemoMyBets } from '@/lib/demoPublicData'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const PAGE_SIZE = 20

export function useMyBets(status: string | null, page: number) {
  const { user } = useAuth()
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  return useQuery({
    queryKey: ['myBets', user?.id, status, page],
    enabled: !!user?.id,
    queryFn: async () => {
      if (isDemoMode()) return getDemoMyBets(user!.id, status, page, PAGE_SIZE)
      let q = supabase
        .from('bets')
        .select(
          `*,
          bet_events ( id, title, status, closes_at,
            episodes ( number, title )
          )`,
          { count: 'exact' },
        )
        .eq('user_id', user!.id)
        .order('placed_at', { ascending: false })
        .range(from, to)
      if (status) q = q.eq('status', status)
      const { data, error, count } = await q
      if (error) throw error
      return { rows: data ?? [], total: count ?? 0, pageSize: PAGE_SIZE }
    },
  })
}
