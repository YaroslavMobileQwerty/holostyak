import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useRejectPurchase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { requestId: string; reason: string }) => {
      const { error } = await supabase.rpc('reject_purchase_request', {
        request_id: input.requestId,
        reason: input.reason,
      })
      if (error) throw error
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['adminPurchaseQueue'] })
      await qc.invalidateQueries({ queryKey: ['purchaseRequests'] })
    },
  })
}
