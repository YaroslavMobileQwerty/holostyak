import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useLockBetEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase.rpc('lock_bet_event', { p_event_id: eventId })
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['betEvent'] })
      void qc.invalidateQueries({ queryKey: ['betEventsByEpisode'] })
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents'] })
      void qc.invalidateQueries({ queryKey: ['adminBetEventsResolution'] })
    },
  })
}
