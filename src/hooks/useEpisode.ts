import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { getDemoEpisode } from '@/lib/demoPublicData'
import { supabase } from '@/lib/supabase'

export function useEpisode(id: string | undefined) {
  return useQuery({
    queryKey: ['episode', id],
    enabled: !!id,
    queryFn: async () => {
      if (isDemoMode() && id) {
        const row = getDemoEpisode(id)
        if (row) return row
      }
      const { data, error } = await supabase
        .from('episodes')
        .select('*, season:seasons(number, title)')
        .eq('id', id!)
        .single()
      if (error) throw error
      return data
    },
  })
}
