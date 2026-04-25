import { useState } from 'react'
import { useActiveSeason } from '@/hooks/useActiveSeason'
import { useBachelors } from '@/hooks/useBachelors'
import { useParticipants } from '@/hooks/useParticipants'
import { BachelorCard } from '@/components/ui/BachelorCard'
import { ParticipantCard } from '@/components/ui/ParticipantCard'
import { Skeleton } from '@/components/ui/Skeleton'

type Filter = 'all' | 'bach1' | 'bach2' | 'eliminated'

export function SeasonPage() {
  const { data: season, isLoading: seasonLoading } = useActiveSeason()
  const { data: bachelors } = useBachelors(season?.id)
  const { data: participants, isLoading: partLoading } = useParticipants(season?.id)
  const [filter, setFilter] = useState<Filter>('all')
  const twoBachelors = bachelors && bachelors.length >= 2
  const effective: Filter = !twoBachelors && filter === 'bach2' ? 'all' : filter

  if (seasonLoading) {
    return (
      <div className="py-10">
        <Skeleton className="mb-4 h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!season) {
    return <p className="py-20 text-center text-rose-dust">Сезон поки не активний</p>
  }

  const filtered = participants?.filter((p) => {
    if (effective === 'all') return true
    if (effective === 'eliminated') return p.status === 'eliminated'
    if (effective === 'bach1')
      return p.current_bachelor_id === bachelors?.[0]?.id && p.status === 'active'
    if (effective === 'bach2')
      return p.current_bachelor_id === bachelors?.[1]?.id && p.status === 'active'
    return true
  })

  return (
    <div className="py-10">
      <header>
        <h1 className="font-serif text-4xl">{season.title}</h1>
      </header>

      {bachelors && bachelors.length > 0 && (
        <section
          className={`mt-8 grid gap-4 ${bachelors.length === 1 ? 'mx-auto max-w-md' : 'md:grid-cols-2'}`}
        >
          {bachelors.map((b) => (
            <BachelorCard
              key={b.id}
              name={b.name}
              bio={b.bio}
              photoUrl={b.photo_url}
              orderIndex={b.order_index}
            />
          ))}
        </section>
      )}

      <section className="mt-12">
        <div className="mb-4 flex flex-wrap gap-2">
          {(
            (twoBachelors
              ? (['all', 'bach1', 'bach2', 'eliminated'] as const)
              : (['all', 'bach1', 'eliminated'] as const)) as Filter[]
          ).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                effective === f
                  ? 'border-primary-live bg-primary-live/10 text-primary-live'
                  : 'border-white/20'
              }`}
            >
              {f === 'all'
                ? 'Усі'
                : f === 'eliminated'
                  ? 'Еліміновані'
                  : `Холостяк ${f.slice(-1)}`}
            </button>
          ))}
        </div>

        {partLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered?.map((p) => (
              <ParticipantCard
                key={p.id}
                name={p.name}
                age={p.age}
                city={p.city}
                photoUrl={p.photo_url}
                status={p.status}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
