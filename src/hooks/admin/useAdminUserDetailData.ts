import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAdminListUsers } from '@/hooks/admin/useAdminListUsers'

export function useAdminUserById(id: string | undefined) {
  return useAdminListUsers(
    {
      search: '',
      role: 'all',
      banned: 'all',
      minBalance: '',
      maxBalance: '',
      userId: id,
      listLimit: 1,
    },
    { enabled: Boolean(id) },
  )
}

export function useCoinTransactionsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['adminCoinTx', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return data
    },
  })
}

export function useBetsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['adminBets', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bets')
        .select('*, bet_events ( id, title, status ), bet_options ( custom_label, odds )')
        .eq('user_id', userId!)
        .order('placed_at', { ascending: false })
        .limit(200)
      if (error) throw error
      return data
    },
  })
}

export function usePurchaseRequestsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['adminPurchaseReq', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coin_purchase_requests')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data
    },
  })
}

export function useAdminAuditForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['adminAuditForUser', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(400)
      if (error) throw error
      return (data ?? []).filter((row) => {
        if (row.target_id === userId) return true
        const p = row.payload as Record<string, unknown> | null
        if (p && p.user_id != null) return String(p.user_id) === userId
        return false
      })
    },
  })
}
