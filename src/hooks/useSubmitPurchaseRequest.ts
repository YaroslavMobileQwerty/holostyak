import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trackPlausible } from '@/analytics/plausible'
import { isDemoMode } from '@/lib/demoMode'
import { supabase } from '@/lib/supabase'
import { toWebpFile } from '@/lib/toWebpFile'
import { useAuth } from '@/hooks/useAuth'

export function useSubmitPurchaseRequest() {
  const { user } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { amount: number; userComment?: string; screenshot: File }) => {
      if (isDemoMode()) {
        throw new Error('Демо-режим: заявки на коїни не відправляються.')
      }
      if (!user?.id) throw new Error('Not authenticated')
      const webp = await toWebpFile(input.screenshot)
      const path = `${user.id}/${crypto.randomUUID()}.webp`
      const { error: upErr } = await supabase.storage.from('screenshots').upload(path, webp, {
        contentType: 'image/webp',
        upsert: false,
      })
      if (upErr) throw upErr

      const { data, error } = await supabase.rpc('submit_purchase_request', {
        requested_amount: input.amount,
        screenshot_path: path,
        user_comment: input.userComment?.trim() || null,
      })
      if (error) throw error
      return data
    },
    onSuccess: async () => {
      trackPlausible('donation_submitted')
      await qc.invalidateQueries({ queryKey: ['purchaseRequests'] })
      await qc.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
