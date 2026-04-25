import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function usePurchaseRequests() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['purchaseRequests', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (isDemoMode()) return []
      const { data, error } = await supabase
        .from('coin_purchase_requests')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })
}
