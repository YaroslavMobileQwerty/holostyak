import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useBachelors(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['bachelors', seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
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
