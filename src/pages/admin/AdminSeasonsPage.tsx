import { useState } from 'react'
import { toast } from 'sonner'
import { useAdminSeasons, useAdminSeasonMutations } from '@/hooks/admin/useAdminCatalog'
import { SeasonFinalizeModal } from '@/components/admin/SeasonFinalizeModal'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Tables } from '@/lib/database.types'

export function AdminSeasonsPage() {
  const { data: seasons, isLoading } = useAdminSeasons()
  const { create, setStatus, update } = useAdminSeasonMutations()
  const [num, setNum] = useState('15')
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<Tables<'seasons'> | null>(null)
  const [finalizing, setFinalizing] = useState<Tables<'seasons'> | null>(null)

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Сезони</h1>
      {isLoading ? <Skeleton className="mt-4 h-32" /> : null}
      <div className="mt-4 rounded border border-white/10 p-4">
        <h2 className="text-sm font-medium text-rose-cream">Новий сезон</h2>
        <div className="mt-2 flex max-w-md flex-col gap-2 sm:flex-row">
          <input
            placeholder="№"
            className="w-20 rounded border border-white/15 bg-bg-base px-2 py-1 font-mono"
            value={num}
            onChange={(e) => setNum(e.target.value)}
          />
          <input
            placeholder="Назва"
            className="flex-1 rounded border border-white/15 bg-bg-base px-2 py-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button
            type="button"
            className="rounded bg-primary px-3 py-1 text-sm text-white"
            disabled={create.isPending}
            onClick={async () => {
              const n = Number.parseInt(num, 10)
              if (!title.trim() || Number.isNaN(n)) {
                toast.error('№ і назва')
                return
              }
              try {
                await create.mutateAsync({
                  p_number: n,
                  p_title: title.trim(),
                  p_status: 'upcoming',
                  p_starts_at: null,
                  p_ends_at: null,
                })
                toast.success('Створено')
                setTitle('')
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Помилка')
              }
            }}
          >
            Додати
          </button>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto">
        {seasons && seasons.length > 0 ? (
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="text-rose-dust">
                <th className="px-2 py-2">№</th>
                <th>Назва</th>
                <th>Статус</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {seasons.map((s) => (
                <tr key={s.id} className="border-t border-white/5">
                  <td className="px-2 py-2 font-mono">{s.number}</td>
                  <td>{s.title}</td>
                  <td>{s.status}</td>
                  <td className="space-x-2">
                    <button
                      type="button"
                      className="text-primary-live underline"
                      onClick={() => setEditing(s)}
                    >
                      Редагувати
                    </button>
                    {s.status !== 'active' ? (
                      <button
                        type="button"
                        className="text-amber-300 underline"
                        onClick={async () => {
                          if (!window.confirm('Активувати цей сезон? Інші active → finished.')) return
                          try {
                            await setStatus.mutateAsync({ p_id: s.id, p_status: 'active' })
                            toast.success('Сезон активний')
                          } catch (e) {
                            toast.error(e instanceof Error ? e.message : 'Помилка')
                          }
                        }}
                      >
                        Активувати
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-rose-300 underline"
                        onClick={() => setFinalizing(s)}
                      >
                        Фіналізувати
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : isLoading ? null : (
          <p className="text-rose-dust">Сезонів ще немає</p>
        )}
      </div>
      <SeasonFinalizeModal
        season={finalizing}
        open={!!finalizing}
        onClose={() => setFinalizing(null)}
      />

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/15 bg-bg-card p-6">
            <h2 className="font-serif text-xl">Редагування</h2>
            <input
              className="mt-2 w-full rounded border border-white/15 bg-bg-base px-2 py-1"
              defaultValue={editing.title}
              id="edit-se-title"
            />
            <input
              className="mt-2 w-full rounded border border-white/15 bg-bg-base px-2 py-1"
              type="number"
              defaultValue={editing.number}
              id="edit-se-num"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded border border-white/20 px-3 py-1"
                onClick={() => setEditing(null)}
              >
                Закрити
              </button>
              <button
                type="button"
                className="rounded bg-primary px-3 py-1 text-white"
                onClick={async () => {
                  const t = (document.getElementById('edit-se-title') as HTMLInputElement).value
                  const n = Number.parseInt(
                    (document.getElementById('edit-se-num') as HTMLInputElement).value,
                    10,
                  )
                  if (!t.trim() || Number.isNaN(n)) {
                    toast.error('Перевірте поля')
                    return
                  }
                  try {
                    await update.mutateAsync({
                      p_id: editing.id,
                      p_number: n,
                      p_title: t.trim(),
                      p_starts_at: editing.starts_at,
                      p_ends_at: editing.ends_at,
                    })
                    toast.success('Збережено')
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
