import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useVoidBetEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { eventId: string; reason: string }) => {
      const { error } = await supabase.rpc('void_bet_event', {
        p_event_id: args.eventId,
        p_reason: args.reason,
      })
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['betEvent'] })
      void qc.invalidateQueries({ queryKey: ['betEventsByEpisode'] })
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents'] })
      void qc.invalidateQueries({ queryKey: ['adminBetEventsResolution'] })
      void qc.invalidateQueries({ queryKey: ['profile'] })
      void qc.invalidateQueries({ queryKey: ['myBets'] })
      void qc.invalidateQueries({ queryKey: ['coinTransactions'] })
    },
  })
}
