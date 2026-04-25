import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { getDemoBachelors } from '@/lib/demoPublicData'
import { supabase } from '@/lib/supabase'

export function useBachelors(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['bachelors', seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      if (isDemoMode() && seasonId) return getDemoBachelors(seasonId)
      const { data, error } = await supabase
        .from('bachelors')
        .select('*')
        .eq('season_id', seasonId!)
        .order('order_index')
      if (error) throw error
      return data
    },
  })
}
