import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { uk } from 'date-fns/locale'
import { useEpisode } from '@/hooks/useEpisode'
import { Skeleton } from '@/components/ui/Skeleton'

export function EpisodeDetailPage() {
  const { id } = useParams()
  const { data: episode, isLoading } = useEpisode(id)

  if (isLoading) {
    return (
      <div className="py-10">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (!episode) {
    return <p className="py-20 text-center text-rose-dust">Випуск не знайдено</p>
  }

  return (
    <article className="py-10">
      <p className="text-xs uppercase tracking-[0.3em] text-primary-live">
        {episode.season?.title} · Випуск {episode.number}
      </p>
      <h1 className="mt-2 font-serif text-4xl">{episode.title ?? `Випуск ${episode.number}`}</h1>
      {episode.airs_at && (
        <p className="mt-2 text-rose-dust">
          Ефір: {format(new Date(episode.airs_at), "d MMMM yyyy 'о' HH:mm", { locale: uk })}
        </p>
      )}

      <section className="mt-10 rounded-2xl border border-white/10 bg-bg-card p-8 text-center">
        <p className="font-serif text-2xl text-rose-dust">Ставки скоро доступні</p>
        <p className="mt-2 text-sm text-rose-dust/70">
          Система ставок буде ввімкнута у Фазі 3. Наразі це попередній перегляд випуску.
        </p>
      </section>
    </article>
  )
}
