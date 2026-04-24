import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useResolveBetEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { eventId: string; winningOptionIds: string[] }) => {
      const { data, error } = await supabase.rpc('resolve_bet_event', {
        p_event_id: args.eventId,
        p_winning_option_ids: args.winningOptionIds,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['betEvent'] })
      void qc.invalidateQueries({ queryKey: ['betEventsByEpisode'] })
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents'] })
      void qc.invalidateQueries({ queryKey: ['adminBetEventsResolution'] })
      void qc.invalidateQueries({ queryKey: ['profile'] })
      void qc.invalidateQueries({ queryKey: ['myBets'] })
      void qc.invalidateQueries({ queryKey: ['coinTransactions'] })
      void qc.invalidateQueries({ queryKey: ['notifications'] })
      void qc.invalidateQueries({ queryKey: ['myAchievements'] })
      void qc.invalidateQueries({ queryKey: ['leaderboard'] })
      void qc.invalidateQueries({ queryKey: ['leaderboardSelf'] })
    },
  })
}
