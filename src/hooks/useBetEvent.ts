import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Tables } from '@/lib/database.types'

export function useBetEvent(eventId: string | undefined) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['betEvent', eventId, user?.id],
    enabled: !!eventId,
    queryFn: async () => {
      const { data: ev, error: e1 } = await supabase
        .from('bet_events')
        .select('*, bet_options(*)')
        .eq('id', eventId!)
        .single()
      if (e1) throw e1
      let myBet: Tables<'bets'> | null = null
      if (user?.id) {
        const { data, error } = await supabase
          .from('bets')
          .select('*')
          .eq('event_id', eventId!)
          .eq('user_id', user.id)
          .maybeSingle()
        if (error) throw error
        myBet = data
      }
      return { event: ev, myBet }
    },
  })
}
