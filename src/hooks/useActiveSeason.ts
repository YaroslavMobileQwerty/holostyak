import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useActiveSeason() {
  return useQuery({
    queryKey: ['activeSeason'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('status', 'active')
        .maybeSingle()
      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000,
  })
}
