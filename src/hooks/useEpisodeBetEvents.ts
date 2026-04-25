import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { getDemoBetEventsForEpisode } from '@/lib/demoPublicData'
import { supabase } from '@/lib/supabase'

export function useEpisodeBetEvents(episodeId: string | undefined) {
  return useQuery({
    queryKey: ['episodeBetEvents', episodeId],
    enabled: !!episodeId,
    queryFn: async () => {
      if (isDemoMode() && episodeId) return getDemoBetEventsForEpisode(episodeId)
      const { data, error } = await supabase
        .from('bet_events')
        .select('*, bet_options(*)')
        .eq('episode_id', episodeId!)
        .neq('type', 'lightning')
        .in('status', ['open', 'closed', 'resolved', 'void'])
        .order('closes_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}
