import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type PurchaseStatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export function useAdminPurchaseQueue(status: PurchaseStatusFilter) {
  return useQuery({
    queryKey: ['adminPurchaseQueue', status],
    queryFn: async () => {
      let q = supabase
        .from('coin_purchase_requests')
        .select(
          `
          *,
          user:profiles!coin_purchase_requests_user_id_fkey(nickname)
        `,
        )
        .order('created_at', { ascending: false })
      if (status !== 'all') q = q.eq('status', status)
      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}
