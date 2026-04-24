import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TablesInsert } from '@/lib/database.types'

export function useCreateBetEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (row: TablesInsert<'bet_events'>) => {
      const { data, error } = await supabase.from('bet_events').insert(row).select('id').single()
      if (error) throw error
      return data.id
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['adminEpisodes'] })
      void qc.invalidateQueries({ queryKey: ['betEventsByEpisode'] })
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents'] })
      void qc.invalidateQueries({ queryKey: ['adminBetEventsResolution'] })
    },
  })
}
