import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { decidePollingIntervalMs } from '@/hooks/realtime/livePolling'

export function useLiveEpisodePolling(opts: {
  episodeId: string | undefined
  episodeIsLive: boolean
  wsFailed: boolean
}) {
  const qc = useQueryClient()
  const interval = decidePollingIntervalMs(opts.episodeIsLive, opts.wsFailed)

  useEffect(() => {
    if (!opts.episodeId || interval <= 0) return
    const id = window.setInterval(() => {
      void qc.invalidateQueries({ queryKey: ['episode', opts.episodeId] })
      void qc.invalidateQueries({ queryKey: ['episodeBetEvents', opts.episodeId] })
      void qc.invalidateQueries({ queryKey: ['lightning', opts.episodeId] })
    }, interval)
    return () => clearInterval(id)
  }, [opts.episodeId, interval, qc])
}
