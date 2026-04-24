import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Tables } from '@/lib/database.types'

export function useMyBetsForEpisode(episodeId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['myBetsEpisode', user?.id, episodeId],
    enabled: !!user?.id && !!episodeId,
    queryFn: async () => {
      const { data: evs, error: e1 } = await supabase
        .from('bet_events')
        .select('id')
        .eq('episode_id', episodeId!)
      if (e1) throw e1
      const ids = (evs ?? []).map((r) => r.id)
      if (ids.length === 0) return new Map<string, Tables<'bets'>>()
      const { data: bets, error: e2 } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user!.id)
        .in('event_id', ids)
      if (e2) throw e2
      const m = new Map<string, Tables<'bets'>>()
      for (const b of bets ?? []) m.set(b.event_id, b)
      return m
    },
  })
}
