import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useLightningEvents(
  episodeId: string | undefined,
  opts?: { refetchIntervalMs?: number | false },
) {
  return useQuery({
    queryKey: ['lightning', episodeId],
    enabled: !!episodeId,
    refetchInterval: opts?.refetchIntervalMs ?? false,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bet_events')
        .select('*, bet_options(*)')
        .eq('episode_id', episodeId!)
        .eq('type', 'lightning')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}
