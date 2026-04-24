import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

type AuditFilters = {
  action: string
  adminId: string
}

export function useAdminAuditLog(filters: AuditFilters) {
  return useQuery({
    queryKey: ['adminAuditLog', filters.action, filters.adminId],
    queryFn: async () => {
      let q = supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(200)
      if (filters.action.trim() !== '') {
        q = q.eq('action', filters.action.trim())
      }
      if (filters.adminId.trim() !== '') {
        q = q.eq('admin_id', filters.adminId.trim())
      }
      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}
