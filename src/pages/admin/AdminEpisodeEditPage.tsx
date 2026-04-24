import { useParams } from 'react-router-dom'
import { useEpisode } from '@/hooks/useEpisode'
import { useBetEventsByEpisode } from '@/hooks/admin/useBetEventsByEpisode'
import { Skeleton } from '@/components/ui/Skeleton'
import { EpisodeStatusControl } from '@/components/admin/EpisodeStatusControl'
import { BetEventForm } from '@/components/admin/BetEventForm'
import { BetEventsTable, type BetEventRow } from '@/components/admin/BetEventsTable'

export function AdminEpisodeEditPage() {
  const { id } = useParams()
  const { data: ep, isLoading: l1 } = useEpisode(id)
  const { data: betRows, isLoading: l2, refetch } = useBetEventsByEpisode(id)

  if (l1) return <Skeleton className="h-40" />
  if (!ep) return <p className="text-rose-dust">Випуск не знайдено</p>

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">
        {ep.season && typeof ep.season === 'object' && 'title' in ep.season
          ? (ep.season as { title: string }).title
          : 'Сезон'}{' '}
        · випуск {ep.number}
      </h1>
      <p className="mt-1 text-rose-dust">{ep.title}</p>
      <div className="mt-4">
        <EpisodeStatusControl episodeId={ep.id} status={ep.status} />
      </div>
      <div className="mt-8 max-w-2xl">
        <BetEventForm episodeId={ep.id} onCreated={() => void refetch()} />
      </div>
      {l2 ? <Skeleton className="mt-8 h-48" /> : null}
      {betRows?.length ? (
        <BetEventsTable rows={betRows as BetEventRow[]} />
      ) : !l2 ? (
        <p className="mt-8 text-sm text-rose-dust">Ще немає подій. Створіть першу з форми вище.</p>
      ) : null}
    </div>
  )
}
