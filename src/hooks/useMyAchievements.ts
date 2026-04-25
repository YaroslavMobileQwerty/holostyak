import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'
import type { Tables } from '@/lib/database.types'

export type AchievementWithUnlock = Tables<'achievements'> & {
  unlocked_at: string | null
}

export function useMyAchievements() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['myAchievements', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (isDemoMode()) return [] as AchievementWithUnlock[]
      const { data: all, error: e1 } = await supabase
        .from('achievements')
        .select('*')
        .order('sort_order', { ascending: true })
      if (e1) throw e1
      const { data: mine, error: e2 } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user!.id)
      if (e2) throw e2
      const unlockMap = new Map((mine ?? []).map((u) => [u.achievement_id, u.unlocked_at]))
      return (all ?? []).map((a) => ({
        ...a,
        unlocked_at: unlockMap.get(a.id) ?? null,
      })) as AchievementWithUnlock[]
    },
  })
}

/** Full catalog with unlock state for a given user (e.g. admin user detail). */
export function useUserAchievementsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['userAchievementsForUser', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (isDemoMode()) {
        return [] as AchievementWithUnlock[]
      }
      const { data: all, error: e1 } = await supabase
        .from('achievements')
        .select('*')
        .order('sort_order', { ascending: true })
      if (e1) throw e1
      const { data: mine, error: e2 } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId!)
      if (e2) throw e2
      const unlockMap = new Map((mine ?? []).map((u) => [u.achievement_id, u.unlocked_at]))
      return (all ?? []).map((a) => ({
        ...a,
        unlocked_at: unlockMap.get(a.id) ?? null,
      })) as AchievementWithUnlock[]
    },
  })
}

export function useUserAchievementsPublic(userId: string | undefined) {
  return useQuery({
    queryKey: ['userAchievementsPublic', userId],
    enabled: !!userId,
    queryFn: async () => {
      if (isDemoMode()) return [] as AchievementWithUnlock[]
      const { data: ua, error: e1 } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId!)
        .order('unlocked_at', { ascending: false })
      if (e1) throw e1
      const ids = (ua ?? []).map((x) => x.achievement_id)
      if (ids.length === 0) return [] as AchievementWithUnlock[]
      const { data: ach, error: e2 } = await supabase.from('achievements').select('*').in('id', ids)
      if (e2) throw e2
      const byId = new Map((ach ?? []).map((a) => [a.id, a]))
      return (ua ?? [])
        .map((u) => {
          const base = byId.get(u.achievement_id)
          if (!base) return null
          return { ...base, unlocked_at: u.unlocked_at } as AchievementWithUnlock
        })
        .filter((x): x is AchievementWithUnlock => x !== null)
    },
  })
}
