import { useState } from 'react'
import { toast } from 'sonner'
import { useAdminBachelors, useAdminBachelorMutations, useAdminSeasons } from '@/hooks/admin/useAdminCatalog'
import { uploadParticipantPhoto } from '@/lib/adminUploadPhoto'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Tables } from '@/lib/database.types'

export function AdminBachelorsPage() {
  const { data: seasons } = useAdminSeasons()
  const [seasonId, setSeasonId] = useState<string>('')
  const { data: bachelors, isLoading } = useAdminBachelors(seasonId || undefined)
  const { create, update } = useAdminBachelorMutations()
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<Tables<'bachelors'> | null>(null)

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Холостяки</h1>
      <select
        className="mt-4 w-full max-w-sm rounded border border-white/15 bg-bg-base px-2 py-2"
        value={seasonId}
        onChange={(e) => setSeasonId(e.target.value)}
      >
        <option value="">— оберіть сезон —</option>
        {(seasons ?? []).map((s) => (
          <option key={s.id} value={s.id}>
            {s.title} (№{s.number})
          </option>
        ))}
      </select>
      {seasonId ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            placeholder="Ім'я"
            className="max-w-sm flex-1 rounded border border-white/15 bg-bg-base px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            className="rounded border border-white/20 px-3 py-1 text-sm"
            disabled={!name.trim() || create.isPending}
            onClick={async () => {
              try {
                await create.mutateAsync({
                  p_season_id: seasonId,
                  p_name: name.trim(),
                  p_photo_url: null,
                  p_bio: null,
                  p_order_index: 1,
                })
                toast.success('Додано')
                setName('')
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Помилка')
              }
            }}
          >
            Додати без фото
          </button>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              if (!name.trim() || !seasonId) {
                toast.error('Імʼя і сезон')
                return
              }
              const f = e.target.files?.[0]
              if (!f) return
              try {
                const url = await uploadParticipantPhoto(f)
                await create.mutateAsync({
                  p_season_id: seasonId,
                  p_name: name.trim(),
                  p_photo_url: url,
                  p_bio: null,
                  p_order_index: 1,
                })
                toast.success('Додано')
                setName('')
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Помилка')
              }
            }}
          />
        </div>
      ) : null}
      {isLoading && seasonId ? <Skeleton className="mt-4 h-40" /> : null}
      {seasonId && bachelors && bachelors.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[500px] text-left text-sm">
            <tbody>
              {bachelors.map((b) => (
                <tr key={b.id} className="border-t border-white/5">
                  <td className="py-2">
                    {b.name}
                    {b.photo_url ? (
                      <a className="ml-2 text-primary-live" href={b.photo_url} target="_blank" rel="noreferrer">
                        фото
                      </a>
                    ) : null}
                  </td>
                  <td>
                    <button type="button" className="text-primary-live underline" onClick={() => setEditing(b)}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : seasonId && !isLoading ? <p className="mt-2 text-rose-dust">Ще немає холостяків</p> : null}
      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-bg-card p-6 text-sm text-rose-cream">
            <h2 className="font-serif text-xl">Редагування {editing.name}</h2>
            <input
              className="mt-2 w-full rounded border border-white/15 bg-bg-base px-2 py-1"
              defaultValue={editing.name}
              id="ed-name"
            />
            <input
              className="mt-2 w-full rounded border border-white/15 bg-bg-base px-2 py-1"
              type="number"
              defaultValue={editing.order_index}
              id="ed-ord"
            />
            <div className="mt-2">
              <input type="file" accept="image/*" id="ed-ph" />
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" className="rounded border border-white/20 px-3 py-1" onClick={() => setEditing(null)}>
                Закрити
              </button>
              <button
                type="button"
                className="rounded bg-primary px-3 py-1 text-white"
                onClick={async () => {
                  const nm = (document.getElementById('ed-name') as HTMLInputElement).value
                  const oi = Number.parseInt((document.getElementById('ed-ord') as HTMLInputElement).value, 10)
                  const fi = (document.getElementById('ed-ph') as HTMLInputElement).files?.[0]
                  let ph = editing.photo_url
                  if (fi) {
                    ph = await uploadParticipantPhoto(fi)
                  }
                  if (!nm.trim() || Number.isNaN(oi)) {
                    toast.error('Поля')
                    return
                  }
                  try {
                    await update.mutateAsync({
                      p_id: editing.id,
                      p_name: nm.trim(),
                      p_photo_url: ph,
                      p_bio: editing.bio,
                      p_order_index: oi,
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
