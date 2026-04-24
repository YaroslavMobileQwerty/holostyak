import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { parseDeliveryToRpcJson, type DeliveryFormValues } from '@/lib/schemas/deliveryForm'

export function useSubmitDeliveryForm() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { prizeId: string; values: DeliveryFormValues }) => {
      const { error } = await supabase.rpc('submit_delivery_form', {
        p_prize_id: input.prizeId,
        p_form: parseDeliveryToRpcJson(input.values),
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['myPrizes'] })
    },
  })
}
