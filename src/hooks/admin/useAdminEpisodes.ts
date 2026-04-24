import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAdminEpisodes(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['adminEpisodes', seasonId],
    queryFn: async () => {
      let q = supabase
        .from('episodes')
        .select('*, season:seasons(title, number)')
        .order('number', { ascending: true })
      if (seasonId) q = q.eq('season_id', seasonId)
      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },
  })
}
