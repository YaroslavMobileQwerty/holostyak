import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/database.types'

export function useAchievementsCatalog() {
  return useQuery({
    queryKey: ['achievementsCatalog'],
    staleTime: 60 * 60_000,
    queryFn: async () => {
      if (isDemoMode()) return [] as Tables<'achievements'>[]
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data as Tables<'achievements'>[]
    },
  })
}
