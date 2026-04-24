import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TablesUpdate } from '@/lib/database.types'

export function useUpdateBetEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { id: string; patch: TablesUpdate<'bet_events'> }) => {
      const { error } = await supabase.from('bet_events').update(args.patch).eq('id', args.id)
      if (error) throw error
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['adminEpisodes'] })
      void qc.invalidateQueries({ queryKey: ['betEventsByEpisode'] })
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents'] })
      void qc.invalidateQueries({ queryKey: ['betEvent'] })
      void qc.invalidateQueries({ queryKey: ['adminBetEventsResolution'] })
    },
  })
}
