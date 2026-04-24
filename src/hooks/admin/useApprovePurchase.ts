import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useApprovePurchase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: {
      requestId: string
      approvedAmount: number
      adminNote?: string | null
    }) => {
      const { error } = await supabase.rpc('approve_purchase_request', {
        request_id: input.requestId,
        p_approved_amount: input.approvedAmount,
        admin_note: input.adminNote ?? null,
      })
      if (error) throw error
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['adminPurchaseQueue'] })
      await qc.invalidateQueries({ queryKey: ['purchaseRequests'] })
      await qc.invalidateQueries({ queryKey: ['profile'] })
      await qc.invalidateQueries({ queryKey: ['coinTransactions'] })
    },
  })
}
