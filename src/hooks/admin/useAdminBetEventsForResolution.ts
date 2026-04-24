import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/** Події, готові до резолву: закриті прийом або прострочені (відкриті з минулим closes_at). */
export function useAdminBetEventsForResolution() {
  return useQuery({
    queryKey: ['adminBetEventsResolution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bet_events')
        .select('*, bet_options(*), episodes ( id, number, title, status, season_id )')
        .in('status', ['closed', 'open'])
        .order('closes_at', { ascending: true })
      if (error) throw error
      const now = Date.now()
      return (data ?? []).filter((row) => {
        if (row.status === 'closed') return true
        return new Date(row.closes_at).getTime() <= now
      })
    },
  })
}
