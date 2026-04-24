import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useEpisode(id: string | undefined) {
  return useQuery({
    queryKey: ['episode', id],
    enabled: !!id,
    queryFn: async () => {
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
