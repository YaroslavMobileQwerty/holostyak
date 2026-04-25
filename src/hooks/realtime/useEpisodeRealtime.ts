import { useEffect, useRef } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { isDemoMode } from '@/lib/demoMode'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { bumpChannels } from './realtimeHealth'

type EpisodeRow = { status: string }

export function useEpisodeRealtime(
  episodeId: string | undefined,
  opts?: { onChannelError?: () => void },
) {
  const qc = useQueryClient()
  const { user } = useAuth()
  const prevStatus = useRef<string | null>(null)
  const onChannelErrorRef = useRef(opts?.onChannelError)

  useEffect(() => {
    onChannelErrorRef.current = opts?.onChannelError
  }, [opts?.onChannelError])

  useEffect(() => {
    if (isDemoMode() || !episodeId || !user) return

    const ch = supabase
      .channel(`episode-status-${episodeId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'episodes', filter: `id=eq.${episodeId}` },
        (payload: RealtimePostgresChangesPayload<EpisodeRow>) => {
          const next = (payload.new as EpisodeRow | undefined)?.status
          if (!next) return
          if (prevStatus.current !== 'live' && next === 'live') {
            toast.message('Ефір розпочався!')
          }
          prevStatus.current = next
          void qc.invalidateQueries({ queryKey: ['episode', episodeId] })
          void qc.invalidateQueries({ queryKey: ['episodeBetEvents', episodeId] })
          void qc.invalidateQueries({ queryKey: ['lightning', episodeId] })
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          onChannelErrorRef.current?.()
        }
      })

    bumpChannels(1)
    return () => {
      void supabase.removeChannel(ch)
      bumpChannels(-1)
    }
  }, [episodeId, user, qc])
}
