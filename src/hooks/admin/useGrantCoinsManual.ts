import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useGrantCoinsManual() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { targetUserId: string; delta: number; note: string }) => {
      const { error } = await supabase.rpc('grant_coins_manual', {
        target_user_id: input.targetUserId,
        delta: input.delta,
        note: input.note,
      })
      if (error) throw error
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['adminUsers'] })
      await qc.invalidateQueries({ queryKey: ['adminListUsers'] })
      await qc.invalidateQueries({ queryKey: ['profile'] })
      await qc.invalidateQueries({ queryKey: ['coinTransactions'] })
    },
  })
}
