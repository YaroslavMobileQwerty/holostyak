import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

const PAGE_SIZE = 50

export function useCoinTransactions(kind: string | null, page: number) {
  const { user } = useAuth()
  const from = page * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  return useQuery({
    queryKey: ['coinTransactions', user?.id, kind, page],
    enabled: !!user?.id,
    refetchInterval: 30_000,
    queryFn: async () => {
      let q = supabase
        .from('coin_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .range(from, to)
      if (kind) q = q.eq('kind', kind)
      const { data, error, count } = await q
      if (error) throw error
      return { rows: data ?? [], total: count ?? 0, pageSize: PAGE_SIZE }
    },
  })
}
