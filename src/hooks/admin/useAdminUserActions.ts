import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAdminUserActions(userId: string | undefined) {
  const qc = useQueryClient()
  const inv = async () => {
    await qc.invalidateQueries({ queryKey: ['adminListUsers'] })
    if (userId) {
      await qc.invalidateQueries({ queryKey: ['adminAuditForUser', userId] })
    }
    await qc.invalidateQueries({ queryKey: ['adminUsers'] })
    await qc.invalidateQueries({ queryKey: ['profile'] })
  }

  const ban = useMutation({
    mutationFn: async (args: { p_target_id: string; p_reason: string }) => {
      const { error } = await supabase.rpc('admin_ban_user', args)
      if (error) throw error
    },
    onSuccess: inv,
  })
  const unban = useMutation({
    mutationFn: async (p_target_id: string) => {
      const { error } = await supabase.rpc('admin_unban_user', { p_target_id })
      if (error) throw error
    },
    onSuccess: inv,
  })
  const setRole = useMutation({
    mutationFn: async (args: { p_target_id: string; p_role: string }) => {
      const { error } = await supabase.rpc('admin_set_role', args)
      if (error) throw error
    },
    onSuccess: inv,
  })
  const forceNickname = useMutation({
    mutationFn: async (args: { p_target_id: string; p_nickname: string }) => {
      const { error } = await supabase.rpc('admin_force_set_nickname', args)
      if (error) throw error
    },
    onSuccess: inv,
  })
  return { ban, unban, setRole, forceNickname }
}
