import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/Skeleton'
import { LiveDashboardWidget } from '@/components/admin/LiveDashboardWidget'
import { DashboardMetricCard } from '@/components/admin/DashboardMetricCard'
import { useAdminDashboardStats } from '@/hooks/admin/useAdminDashboardStats'

export function AdminDashboardPage() {
  const { data: stats, isLoading: stLoading } = useAdminDashboardStats()
  const { data: liveEp, isLoading: leLoading } = useQuery({
    queryKey: ['adminLiveEp'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('episodes')
        .select('id, number, title')
        .eq('status', 'live')
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Дашборд</h1>
      <p className="mt-1 text-sm text-rose-dust">Метрики оновлюються кожні ~60 c.</p>

      {stLoading ? (
        <Skeleton className="mt-6 h-32" />
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardMetricCard
            label="Заявок на перевірці"
            value={stats?.pending_purchases ?? 0}
            to="/admin/purchases"
            linkText="До заявок →"
          />
          <DashboardMetricCard
            label="Резолв (closed events)"
            value={stats?.pending_resolutions ?? 0}
            to="/admin/resolution"
            linkText="Резолв →"
          />
          <DashboardMetricCard label="Активні в ставках (24h)" value={stats?.active_bettors_24h ?? 0} />
          <DashboardMetricCard label="Оборот ставок 24h" value={stats?.total_staked_24h ?? 0} />
          <DashboardMetricCard label="Нові профілі 24h" value={stats?.signups_24h ?? 0} />
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-white/10 bg-bg-card p-4 text-sm text-rose-dust">
        {leLoading ? <Skeleton className="h-8" /> : liveEp ? (
          <p>
            <span className="text-rose-cream">Live-епізод: </span>
            {liveEp.title ?? `Випуск ${liveEp.number}`} —{' '}
            <Link className="text-primary-live hover:underline" to={`/admin/live/${liveEp.id}`}>
              панель live
            </Link>
          </p>
        ) : (
          <p>
            Нема live-епізоду. <Link to="/admin/episodes" className="text-primary-live hover:underline">Випуски</Link>
          </p>
        )}
      </div>

      <LiveDashboardWidget />
    </div>
  )
}
