import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useBetEventsByEpisode(episodeId: string | undefined) {
  return useQuery({
    queryKey: ['betEventsByEpisode', episodeId],
    enabled: !!episodeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bet_events')
        .select('*, bet_options(*)')
        .eq('episode_id', episodeId!)
        .order('closes_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}
