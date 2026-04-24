import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useParticipants(seasonId: string | undefined) {
  return useQuery({
    queryKey: ['participants', seasonId],
    enabled: !!seasonId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*, bachelor:bachelors(name)')
        .eq('season_id', seasonId!)
        .order('name')
      if (error) throw error
      return data
    },
  })
}
