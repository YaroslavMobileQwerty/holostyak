import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useDeleteBetOption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (optionId: string) => {
      const { error } = await supabase.rpc('delete_bet_option', { p_option_id: optionId })
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['betEvent'] })
      void qc.invalidateQueries({ queryKey: ['betEventsByEpisode'] })
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents'] })
    },
  })
}
