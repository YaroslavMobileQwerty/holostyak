import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Tables } from '@/lib/database.types'

export type MyPrizeRow = Tables<'season_prizes'> & {
  seasons: { number: number; title: string } | null
}

export function useMyPrizes() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['myPrizes', user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (isDemoMode()) return [] as MyPrizeRow[]
      const { data, error } = await supabase
        .from('season_prizes')
        .select('*, seasons (number, title)')
        .eq('user_id', user!.id)
        .order('place', { ascending: true })
      if (error) throw error
      return (data ?? []) as MyPrizeRow[]
    },
  })
}
