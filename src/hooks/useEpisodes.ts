import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useEpisodes(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['episodes', seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .eq('season_id', seasonId!)
        .order('number')
      if (error) throw error
      return data
    },
  })
}
