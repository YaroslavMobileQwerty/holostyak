import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useAdminUsers(search: string) {
  const q = search.trim()
  return useQuery({
    queryKey: ['adminUsers', q],
    queryFn: async () => {
      let rq = supabase
        .from('profiles')
        .select('id, nickname, balance, role, created_at')
        .order('created_at', { ascending: false })
        .limit(100)
      if (q.length > 0) rq = rq.ilike('nickname', `%${q}%`)
      const { data, error } = await rq
      if (error) throw error
      return data
    },
  })
}
