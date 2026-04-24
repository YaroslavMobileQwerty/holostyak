import { useActiveSeason } from '@/hooks/useActiveSeason'
import { useEpisodes } from '@/hooks/useEpisodes'
import { EpisodeCard } from '@/components/ui/EpisodeCard'
import { Skeleton } from '@/components/ui/Skeleton'

export function EpisodesPage() {
  const { data: season } = useActiveSeason()
  const { data: episodes, isLoading } = useEpisodes(season?.id)

  return (
    <div className="py-10">
      <h1 className="font-serif text-4xl">Випуски</h1>
      <p className="mt-2 text-rose-dust">
        Всі серії сезону. Клікай щоб побачити події та ставки.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)
          : episodes?.map((e) => (
              <EpisodeCard
                key={e.id}
                id={e.id}
                number={e.number}
                title={e.title}
                airsAt={e.airs_at}
                status={e.status}
              />
            ))}
      </section>
    </div>
  )
}
