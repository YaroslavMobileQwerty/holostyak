import { useEffect, useRef } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { bumpChannels } from './realtimeHealth'
import type { Tables } from '@/lib/database.types'

type BetEventRow = Tables<'bet_events'>

function isLightningPayload(row: unknown): row is BetEventRow {
  return (
    !!row &&
    typeof row === 'object' &&
    'type' in row &&
    (row as { type: string }).type === 'lightning'
  )
}

export function useLightningRealtime(
  episodeId: string | undefined,
  opts?: {
    onChannelError?: () => void
    onNewLightning?: (eventId: string) => void
  },
) {
  const qc = useQueryClient()
  const { user } = useAuth()
  const onChannelErrorRef = useRef(opts?.onChannelError)
  const onNewLightningRef = useRef(opts?.onNewLightning)

  useEffect(() => {
    onChannelErrorRef.current = opts?.onChannelError
    onNewLightningRef.current = opts?.onNewLightning
  }, [opts?.onChannelError, opts?.onNewLightning])

  useEffect(() => {
    if (isDemoMode() || !episodeId || !user) return
    const userId = user.id

    const invalidate = () => {
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents', episodeId] })
      void qc.invalidateQueries({ queryKey: ['lightning', episodeId] })
      void qc.invalidateQueries({ queryKey: ['betEvent'] })
      void qc.invalidateQueries({ queryKey: ['myBetsEpisode', userId, episodeId] })
    }

    const handlePayload = (payload: RealtimePostgresChangesPayload<BetEventRow>) => {
      const row = payload.new as BetEventRow | null | undefined
      if (!isLightningPayload(row)) return
      if (payload.eventType === 'INSERT') {
        onNewLightningRef.current?.(row.id)
      }
      invalidate()
    }

    const ch = supabase
      .channel(`lightning-bet-events-${episodeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bet_events',
          filter: `episode_id=eq.${episodeId}`,
        },
        handlePayload,
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bet_events',
          filter: `episode_id=eq.${episodeId}`,
        },
        handlePayload,
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR') {
          // Sentry: phase 8
          console.warn('[realtime] lightning channel error', { episodeId })
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
