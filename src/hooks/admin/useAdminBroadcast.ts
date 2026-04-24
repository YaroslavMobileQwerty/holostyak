import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Json } from '@/lib/database.types'

export function useAdminBroadcastLog() {
  return useQuery({
    queryKey: ['adminBroadcastLog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_broadcast_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data
    },
  })
}

export function useAdminBroadcastPreview() {
  return useMutation({
    mutationFn: async (filter: Json) => {
      const { data, error } = await supabase.rpc('admin_broadcast_preview_count', { p_filter: filter })
      if (error) throw error
      return data as number
    },
  })
}

export function useAdminBroadcastSend() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (args: { title: string; body: string; filter: Json }) => {
      const { data, error } = await supabase.rpc('admin_broadcast_notification', {
        p_title: args.title,
        p_body: args.body,
        p_filter: args.filter,
      })
      if (error) throw error
      return data as number
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['adminBroadcastLog'] })
    },
  })
}
