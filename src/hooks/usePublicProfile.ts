import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { getDemoPublicProfileByNickname } from '@/lib/demoPublicData'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/lib/database.types'

export type PublicProfileRow = Pick<
  Tables<'profiles'>,
  'id' | 'nickname' | 'avatar_url' | 'created_at' | 'total_won' | 'total_bets' | 'correct_bets' | 'streak_best'
>

export function usePublicProfile(nickname: string | undefined) {
  const key = nickname?.trim()
  return useQuery({
    queryKey: ['publicProfile', key],
    enabled: !!key,
    queryFn: async () => {
      if (isDemoMode()) return getDemoPublicProfileByNickname(key!) ?? null
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, created_at, total_won, total_bets, correct_bets, streak_best')
        .eq('nickname', key!)
        .maybeSingle()
      if (error) throw error
      return data as PublicProfileRow | null
    },
  })
}
