import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type PreviewRow = {
  user_id: string
  nickname: string | null
  place_preview: number
  season_total_won: number
}

export function usePreviewFinalizeQuery(seasonId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['previewFinalize', seasonId],
    enabled: enabled && !!seasonId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('preview_finalize_season', {
        p_season_id: seasonId!,
      })
      if (error) throw new Error(error.message)
      return data as { preview: PreviewRow[] }
    },
  })
}

export function useFinalizeSeason() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { seasonId: string; force: boolean }) => {
      const { data, error } = await supabase.rpc('finalize_season', {
        p_season_id: input.seasonId,
        p_force: input.force,
      })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['adminSeasonPrizes'] })
      void queryClient.invalidateQueries({ queryKey: ['adminSeasons'] })
      void queryClient.invalidateQueries({ queryKey: ['previewFinalize'] })
    },
  })
}
