import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export type AdminListUserRow = {
  id: string
  nickname: string | null
  email: string
  role: string
  is_banned: boolean
  balance: number
  total_bets: number
  correct_bets: number
  created_at: string
}

export function useAdminListUsers(
  filters: {
    search: string
    role: 'all' | 'user' | 'admin'
    banned: 'all' | 'yes' | 'no'
    minBalance: string
    maxBalance: string
    userId?: string
    listLimit?: number
  },
  options?: { enabled?: boolean },
) {
  const q = filters.search.trim()
  return useQuery({
    enabled: options?.enabled ?? true,
    queryKey: [
      'adminListUsers',
      q,
      filters.role,
      filters.banned,
      filters.minBalance,
      filters.maxBalance,
      filters.userId,
    ],
    queryFn: async () => {
      const minB = filters.minBalance.trim() === '' ? null : Number.parseInt(filters.minBalance, 10)
      const maxB = filters.maxBalance.trim() === '' ? null : Number.parseInt(filters.maxBalance, 10)
      const { data, error } = await supabase.rpc('admin_list_users', {
        p_search: q.length > 0 ? q : null,
        p_role_filter: filters.role === 'all' ? null : filters.role,
        p_banned:
          filters.banned === 'all' ? null : filters.banned === 'yes' ? true : false,
        p_min_balance: minB != null && !Number.isNaN(minB) ? minB : null,
        p_max_balance: maxB != null && !Number.isNaN(maxB) ? maxB : null,
        p_limit: filters.userId ? 1 : (filters.listLimit ?? 200),
        p_user_id: filters.userId ?? null,
      })
      if (error) throw error
      return (data ?? []) as AdminListUserRow[]
    },
  })
}
