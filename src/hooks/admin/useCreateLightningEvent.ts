import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Json } from '@/lib/database.types'

export type LightningOptionInput = {
  custom_label: string
  participant_id?: string | null
  odds: number
}

export function useCreateLightningEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: {
      episodeId: string
      title: string
      description?: string | null
      bachelorId?: string | null
      lockTimeSeconds: number
      options: LightningOptionInput[]
      maxBetAmount?: number | null
    }) => {
      const { data, error } = await supabase.rpc('create_lightning_event', {
        p_episode_id: args.episodeId,
        p_title: args.title,
        p_description: args.description ?? null,
        p_bachelor_id: args.bachelorId ?? null,
        p_lock_time_seconds: args.lockTimeSeconds,
        p_options: args.options as Json,
        p_max_bet_amount: args.maxBetAmount ?? null,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: (_id, args) => {
      void qc.invalidateQueries({ queryKey: ['lightning', args.episodeId] })
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents', args.episodeId] })
      void qc.invalidateQueries({ queryKey: ['betEventsByEpisode', args.episodeId] })
      void qc.invalidateQueries({ queryKey: ['adminBetEventsResolution'] })
    },
  })
}
