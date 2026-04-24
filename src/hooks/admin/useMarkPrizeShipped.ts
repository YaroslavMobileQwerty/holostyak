import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMarkPrizeShipped() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { prizeId: string; tracking: string }) => {
      const { error } = await supabase.rpc('admin_mark_prize_shipped', {
        p_prize_id: input.prizeId,
        p_tracking: input.tracking,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminSeasonPrizes'] })
      void queryClient.invalidateQueries({ queryKey: ['myPrizes'] })
    },
  })
}

export function useSetPrizeDelivered() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (prizeId: string) => {
      const { error } = await supabase.rpc('admin_set_prize_delivered', { p_prize_id: prizeId })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminSeasonPrizes'] })
      void queryClient.invalidateQueries({ queryKey: ['myPrizes'] })
    },
  })
}

export function useSetSecretPrizeDescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { prizeId: string; description: string }) => {
      const { error } = await supabase.rpc('admin_set_secret_prize_description', {
        p_prize_id: input.prizeId,
        p_description: input.description,
      })
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminSeasonPrizes'] })
    },
  })
}
