import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useQuickResolveLightning() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { eventId: string; winningOptionId: string; episodeId: string }) => {
      const { error } = await supabase.rpc('quick_resolve_lightning', {
        p_event_id: args.eventId,
        p_winning_option_id: args.winningOptionId,
      })
      if (error) throw error
    },
    onSuccess: (_void, args) => {
      void qc.invalidateQueries({ queryKey: ['lightning', args.episodeId] })
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents', args.episodeId] })
      void qc.invalidateQueries({ queryKey: ['betEventsByEpisode', args.episodeId] })
      void qc.invalidateQueries({ queryKey: ['adminBetEventsResolution'] })
      void qc.invalidateQueries({ queryKey: ['profile'] })
      void qc.invalidateQueries({ queryKey: ['myBets'] })
      void qc.invalidateQueries({ queryKey: ['myBetsEpisode'] })
      void qc.invalidateQueries({ queryKey: ['coinTransactions'] })
      void qc.invalidateQueries({ queryKey: ['betEvent'] })
    },
  })
}
