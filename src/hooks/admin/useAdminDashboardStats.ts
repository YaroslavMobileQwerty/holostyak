import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ['adminDashboardStats'],
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_dashboard_stats')
      if (error) throw error
      return data as Record<string, number>
    },
  })
}
