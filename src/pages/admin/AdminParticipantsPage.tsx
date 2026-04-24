import { useState } from 'react'
import { toast } from 'sonner'
import {
  useAdminBachelors,
  useAdminEpisodesBySeason,
  useAdminParticipantMutations,
  useAdminParticipantsList,
  useAdminSeasons,
} from '@/hooks/admin/useAdminCatalog'
import { uploadParticipantPhoto } from '@/lib/adminUploadPhoto'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Tables } from '@/lib/database.types'

const st = ['active', 'eliminated', 'winner', 'runner_up'] as const

export function AdminParticipantsPage() {
  const { data: seasons } = useAdminSeasons()
  const [seasonId, setSeasonId] = useState('')
  const { data: bachelors } = useAdminBachelors(seasonId || undefined)
  const { data: eps } = useAdminEpisodesBySeason(seasonId || undefined)
  const { data: list, isLoading } = useAdminParticipantsList(seasonId || undefined)
  const { create, update } = useAdminParticipantMutations()
  const [editing, setEditing] = useState<Tables<'participants'> | null>(null)
  const [name, setName] = useState('')
  const [currentB, setCurrentB] = useState<string>('')
  const [status, setStatus] = useState<(typeof st)[number]>('active')
  const [elim, setElim] = useState('')

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Учасниці / учасники</h1>
      <select
        className="mt-4 w-full max-w-sm rounded border border-white/15 bg-bg-base px-2 py-2"
        value={seasonId}
        onChange={(e) => {
          setSeasonId(e.target.value)
          setCurrentB('')
        }}
      >
        <option value="">— сезон —</option>
        {(seasons ?? []).map((s) => (
          <option key={s.id} value={s.id}>
            {s.title}
          </option>
        ))}
      </select>
      {seasonId ? (
        <div className="mt-4 max-w-2xl space-y-2 rounded border border-white/10 p-4 text-sm text-rose-cream">
          <input
            placeholder="Ім'я"
            className="w-full rounded border border-white/15 bg-bg-base px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select
            className="w-full rounded border border-white/15 bg-bg-base px-2 py-1"
            value={currentB}
            onChange={(e) => setCurrentB(e.target.value)}
          >
            <option value="">— холостяк —</option>
            {(bachelors ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="вік (опц.)"
            className="w-32 rounded border border-white/15 bg-bg-base px-2 py-1 font-mono"
            id="p-age"
          />
          <input placeholder="місто" className="w-full rounded border border-white/15 bg-bg-base px-2 py-1" id="p-city" />
          <input type="file" accept="image/*" id="p-ph" className="text-xs" />
          <select
            className="w-full rounded border border-white/15 bg-bg-base px-2 py-1"
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof st)[number])}
          >
            {st.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded border border-white/15 bg-bg-base px-2 py-1"
            value={elim}
            onChange={(e) => setElim(e.target.value)}
          >
            <option value="">виліт (епізод, опц.)</option>
            {(eps ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.number} {e.title ?? ''}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded bg-primary px-3 py-1.5 text-white"
            onClick={async () => {
              if (!name.trim() || !seasonId) {
                toast.error("Ім'я / сезон")
                return
              }
              const ageVal = (document.getElementById('p-age') as HTMLInputElement).value
              const age = ageVal ? Number.parseInt(ageVal, 10) : null
              const city = (document.getElementById('p-city') as HTMLInputElement).value
              const fi = (document.getElementById('p-ph') as HTMLInputElement).files?.[0]
              let ph: string | null = null
              if (fi) {
                ph = await uploadParticipantPhoto(fi)
              }
              const elimId = elim || null
              const bachId = currentB || null
              try {
                await create.mutateAsync({
                  p_season_id: seasonId,
                  p_name: name.trim(),
                  p_current_bachelor_id: bachId,
                  p_age: age != null && !Number.isNaN(age) ? age : null,
                  p_city: city || null,
                  p_photo_url: ph,
                  p_bio: null,
                  p_status: status,
                  p_eliminated_episode_id: elimId,
                })
                toast.success('Додано')
                setName('')
                setElim('')
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Помилка')
              }
            }}
          >
            Додати
          </button>
        </div>
      ) : null}
      {isLoading && seasonId ? <Skeleton className="mt-4 h-32" /> : null}
      {list && list.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-t border-white/5">
                  <td className="py-2 pr-2">{p.name}</td>
                  <td>{p.status}</td>
                  <td>
                    <button
                      type="button"
                      className="text-primary-live underline"
                      onClick={() => {
                        setEditing(p)
                        setStatus(p.status as (typeof st)[number])
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {editing && seasonId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-bg-card p-6 text-rose-cream">
            <h2 className="font-serif text-xl">Ред. {editing.name}</h2>
            <input
              className="mt-2 w-full rounded border border-white/15 bg-bg-base px-2 py-1"
              defaultValue={editing.name}
              id="ed-pn"
            />
            <select className="mt-2 w-full rounded border border-white/15 bg-bg-base px-2 py-1" id="ed-ps" defaultValue={editing.status}>
              {st.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded border border-white/20 px-3 py-1" onClick={() => setEditing(null)}>
                ×
              </button>
              <button
                type="button"
                className="rounded bg-primary px-3 py-1 text-white"
                onClick={async () => {
                  const n = (document.getElementById('ed-pn') as HTMLInputElement).value
                  const s = (document.getElementById('ed-ps') as HTMLSelectElement).value as (typeof st)[number]
                  if (!n.trim()) {
                    toast.error('Ім’я')
                    return
                  }
                  try {
                    await update.mutateAsync({
                      p_id: editing.id,
                      p_name: n.trim(),
                      p_current_bachelor_id: editing.current_bachelor_id,
                      p_age: editing.age,
                      p_city: editing.city,
                      p_photo_url: editing.photo_url,
                      p_bio: editing.bio,
                      p_status: s,
                      p_eliminated_episode_id: editing.eliminated_episode_id,
                    })
                    toast.success('OK')
                    setEditing(null)
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Помилка')
                  }
                }}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
