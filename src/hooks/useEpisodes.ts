import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { getDemoEpisodes } from '@/lib/demoPublicData'
import { supabase } from '@/lib/supabase'

export function useEpisodes(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['episodes', seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      if (isDemoMode() && seasonId) return getDemoEpisodes(seasonId)
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
