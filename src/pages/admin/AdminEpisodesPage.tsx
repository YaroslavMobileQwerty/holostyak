import { Link } from 'react-router-dom'
import { useAdminEpisodes } from '@/hooks/admin/useAdminEpisodes'
import { Skeleton } from '@/components/ui/Skeleton'

export function AdminEpisodesPage() {
  const { data, isLoading } = useAdminEpisodes(undefined)
  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Випуски</h1>
      <p className="mt-2 text-sm text-rose-dust">Редагування подій і статусу випуску.</p>
      {isLoading ? (
        <Skeleton className="mt-6 h-64" />
      ) : (
        <ul className="mt-6 space-y-2">
          {data?.map((ep) => (
            <li key={ep.id}>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 px-4 py-3 hover:bg-white/5">
                <Link to={`/admin/episode/${ep.id}`} className="min-w-0 flex-1 text-rose-cream">
                  {ep.season?.title ?? 'Сезон'} · випуск {ep.number}
                  <span className="ml-2 text-sm text-rose-dust">({ep.status})</span>
                </Link>
                <Link
                  to={`/admin/live/${ep.id}`}
                  className="shrink-0 rounded-md border border-primary/30 px-2 py-1 text-xs text-primary-live hover:bg-primary/10"
                >
                  Ефір
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
