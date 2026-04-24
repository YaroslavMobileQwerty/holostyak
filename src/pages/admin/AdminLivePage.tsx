import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useEpisode } from '@/hooks/useEpisode'
import { EpisodeStatusControl } from '@/components/admin/EpisodeStatusControl'
import { LightningControlPanel } from '@/components/admin/LightningControlPanel'
import { Skeleton } from '@/components/ui/Skeleton'

export function AdminLivePage() {
  const { episodeId } = useParams()
  const { data: episode, isLoading } = useEpisode(episodeId)

  if (!episodeId) {
    return <p className="text-rose-dust">Невірний маршрут</p>
  }

  if (isLoading) {
    return <Skeleton className="h-40 w-full max-w-lg" />
  }

  if (!episode) {
    return (
      <p className="text-rose-dust">
        Випуск не знайдено.{' '}
        <Link to="/admin/episodes" className="text-primary-live underline">
          До списку
        </Link>
      </p>
    )
  }

  const seasonTitle =
    episode.season && typeof episode.season === 'object' && 'title' in episode.season
      ? (episode.season as { title: string }).title
      : 'Сезон'

  return (
    <div>
      <Link to="/admin/episodes" className="text-sm text-primary-live underline-offset-4 hover:underline">
        ← Випуски
      </Link>
      <h1 className="mt-4 font-serif text-3xl text-rose-cream">
        Ефір: {seasonTitle} · випуск {episode.number}
      </h1>
      <p className="mt-2 text-sm text-rose-dust">
        Керування блискавками під час прямого ефіру. Переконайтесь, що статус випуску —{' '}
        <strong className="text-rose-cream">live</strong>.
      </p>
      <div className="mt-4">
        <EpisodeStatusControl episodeId={episode.id} status={episode.status} />
      </div>
      <LightningControlPanel episodeId={episode.id} />
    </div>
  )
}
