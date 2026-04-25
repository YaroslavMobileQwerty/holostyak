import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import {
  getDemoLeaderboardAllRows,
  getDemoLeaderboardSeasonLikeRows,
} from '@/lib/demoPublicData'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export type LeaderboardScope = 'all' | 'season' | 'week'

export type LeaderboardRowModel = {
  user_id: string
  nickname: string | null
  avatar_url: string | null
  rank_by_won: number
  accuracy: number
  streak_best: number
  achievement_count: number
  total_won: number
  total_bets: number
  correct_bets: number
}

function mapAll(row: {
  user_id: string | null
  nickname: string | null
  avatar_url: string | null
  rank_by_won: number | null
  accuracy: number | null
  streak_best: number | null
  achievement_count: number | null
  total_won: number | null
  total_bets: number | null
  correct_bets: number | null
}): LeaderboardRowModel | null {
  if (!row.user_id) return null
  return {
    user_id: row.user_id,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    rank_by_won: row.rank_by_won ?? 0,
    accuracy: row.accuracy ?? 0,
    streak_best: row.streak_best ?? 0,
    achievement_count: Number(row.achievement_count ?? 0),
    total_won: row.total_won ?? 0,
    total_bets: row.total_bets ?? 0,
    correct_bets: row.correct_bets ?? 0,
  }
}

function mapSeasonWeek(row: {
  user_id: string | null
  nickname: string | null
  avatar_url: string | null
  rank_by_won: number | null
  accuracy: number | null
  streak_best: number | null
  achievement_count: number | null
  season_total_won: number | null
  season_bets: number | null
  season_correct: number | null
}): LeaderboardRowModel | null {
  if (!row.user_id) return null
  return {
    user_id: row.user_id,
    nickname: row.nickname,
    avatar_url: row.avatar_url,
    rank_by_won: row.rank_by_won ?? 0,
    accuracy: row.accuracy ?? 0,
    streak_best: row.streak_best ?? 0,
    achievement_count: Number(row.achievement_count ?? 0),
    total_won: Number(row.season_total_won ?? 0),
    total_bets: Number(row.season_bets ?? 0),
    correct_bets: Number(row.season_correct ?? 0),
  }
}

export function useLeaderboard(scope: LeaderboardScope) {
  return useQuery({
    queryKey: ['leaderboard', scope],
    queryFn: async () => {
      if (isDemoMode()) {
        if (scope === 'all') {
          return getDemoLeaderboardAllRows()
            .map((row) => mapAll(row))
            .filter((r): r is LeaderboardRowModel => r !== null)
        }
        return getDemoLeaderboardSeasonLikeRows()
          .map((row) => mapSeasonWeek(row))
          .filter((r): r is LeaderboardRowModel => r !== null)
      }
      if (scope === 'all') {
        const { data, error } = await supabase
          .from('leaderboard_all_time')
          .select('*')
          .order('rank_by_won', { ascending: true })
          .limit(100)
        if (error) throw error
        return (data ?? []).map(mapAll).filter((r): r is LeaderboardRowModel => r !== null)
      }
      const table = scope === 'season' ? 'leaderboard_season' : 'leaderboard_week'
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('rank_by_won', { ascending: true })
        .limit(100)
      if (error) throw error
      return (data ?? []).map(mapSeasonWeek).filter((r): r is LeaderboardRowModel => r !== null)
    },
  })
}

export function useMyLeaderboardRow(scope: LeaderboardScope) {
  const { user } = useAuth()
  const uid = user?.id
  return useQuery({
    queryKey: ['leaderboardSelf', scope, uid],
    enabled: !!uid,
    queryFn: async () => {
      if (!uid) return null
      if (isDemoMode()) {
        if (scope === 'all') {
          const row = getDemoLeaderboardAllRows().find((r) => r.user_id === uid)
          return row ? mapAll(row) : null
        }
        const row = getDemoLeaderboardSeasonLikeRows().find((r) => r.user_id === uid)
        return row ? mapSeasonWeek(row) : null
      }
      if (scope === 'all') {
        const { data, error } = await supabase
          .from('leaderboard_all_time')
          .select('*')
          .eq('user_id', uid)
          .maybeSingle()
        if (error) throw error
        return data ? mapAll(data) : null
      }
      const table = scope === 'season' ? 'leaderboard_season' : 'leaderboard_week'
      const { data, error } = await supabase.from(table).select('*').eq('user_id', uid).maybeSingle()
      if (error) throw error
      return data ? mapSeasonWeek(data) : null
    },
  })
}
