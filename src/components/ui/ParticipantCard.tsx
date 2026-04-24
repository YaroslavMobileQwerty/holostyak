interface Props {
  name: string
  age?: number | null
  city?: string | null
  photoUrl?: string | null
  status?: string
}

export function ParticipantCard({ name, age, city, photoUrl, status }: Props) {
  const isEliminated = status === 'eliminated'
  return (
    <article
      className={`overflow-hidden rounded-xl border border-white/10 bg-bg-card transition hover:border-primary/40 ${
        isEliminated ? 'opacity-50 grayscale' : ''
      }`}
    >
      <div
        className="aspect-square bg-gradient-to-br from-wine to-burgundy"
        style={
          photoUrl ? { backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover' } : undefined
        }
      />
      <div className="p-3">
        <p className="truncate font-medium">{name}</p>
        <p className="text-xs text-rose-dust">{[age, city].filter(Boolean).join(' · ')}</p>
        {isEliminated && <p className="mt-1 text-xs text-primary-live">Еліміновано</p>}
      </div>
    </article>
  )
}
