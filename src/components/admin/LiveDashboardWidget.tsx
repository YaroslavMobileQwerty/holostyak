import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useRealtimeHealth } from '@/hooks/realtime/useRealtimeHealth'
import { Skeleton } from '@/components/ui/Skeleton'

export function LiveDashboardWidget() {
  const channels = useRealtimeHealth()
  const { data: liveCount, isLoading } = useQuery({
    queryKey: ['adminLiveEpisodesCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('episodes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'live')
      if (error) throw error
      return count ?? 0
    },
  })

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-bg-card p-6">
      <p className="text-xs uppercase tracking-wider text-primary-live">Прямий ефір</p>
      {isLoading ? (
        <Skeleton className="mt-2 h-10 w-24" />
      ) : (
        <p className="mt-2 font-mono text-3xl text-rose-cream">{liveCount}</p>
      )}
      <p className="mt-1 text-sm text-rose-dust">випусків у статусі live</p>
      <Link
        to="/admin/episodes"
        className="mt-4 inline-block text-sm text-primary-live underline-offset-4 hover:underline"
      >
        Відкрити випуски →
      </Link>
      <p className="mt-4 border-t border-white/10 pt-4 text-xs text-rose-dust">
        Active Realtime channel subscriptions:{' '}
        <span className="font-mono text-rose-cream">{channels}</span>
      </p>
    </div>
  )
}
