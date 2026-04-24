import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/database.types'

export type AdminSeasonPrizeRow = Tables<'season_prizes'> & {
  profiles: { nickname: string | null; id: string } | null
  seasons: { number: number; title: string; id: string } | null
}

export function useSeasonPrizes() {
  return useQuery({
    queryKey: ['adminSeasonPrizes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('season_prizes')
        .select('*, profiles!season_prizes_user_id_fkey (id, nickname), seasons (id, number, title)')
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as AdminSeasonPrizeRow[]
    },
  })
}
