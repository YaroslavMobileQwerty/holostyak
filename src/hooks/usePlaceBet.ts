import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

export function usePlaceBet() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (args: { eventId: string; optionId: string; amount: number }) => {
      if (isDemoMode()) {
        throw new Error('Демо-режим: ставки не зберігаються. Вимкніть VITE_DEMO_MODE і підключіть Supabase.')
      }
      const { data, error } = await supabase.rpc('place_bet', {
        p_event_id: args.eventId,
        p_option_id: args.optionId,
        p_amount: args.amount,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents'] })
      void qc.invalidateQueries({ queryKey: ['betEvent'] })
      void qc.invalidateQueries({ queryKey: ['profile', user?.id] })
      void qc.invalidateQueries({ queryKey: ['coinTransactions'] })
      void qc.invalidateQueries({ queryKey: ['myBets'] })
      void qc.invalidateQueries({ queryKey: ['myBetsEpisode', user?.id] })
      void qc.invalidateQueries({ queryKey: ['myAchievements', user?.id] })
      void qc.invalidateQueries({ queryKey: ['notifications', user?.id] })
    },
  })
}
