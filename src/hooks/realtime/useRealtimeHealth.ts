import { useEffect, useRef, useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import { getActiveChannelCount, subscribeActiveChannels } from './realtimeHealth'

export function useRealtimeHealth() {
  const count = useSyncExternalStore(
    subscribeActiveChannels,
    getActiveChannelCount,
    getActiveChannelCount,
  )
  const warned = useRef(false)

  useEffect(() => {
    if (count > 150 && !warned.current) {
      warned.current = true
      toast.warning('Багато активних Realtime-підписок — наближаємось до квоти.')
    }
    if (count <= 150) warned.current = false
  }, [count])

  return count
}
