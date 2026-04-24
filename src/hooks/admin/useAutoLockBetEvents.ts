import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAutoLockBetEvents() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc('auto_lock_expired_events')
      if (error) throw error
      return data as number
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['adminBetEventsResolution'] })
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents'] })
    },
  })
}
