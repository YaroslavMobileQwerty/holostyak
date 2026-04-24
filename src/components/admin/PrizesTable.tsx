import { useMemo, useState } from 'react'
import type { AdminSeasonPrizeRow } from '@/hooks/admin/useSeasonPrizes'
import { DeliveryAddressViewer } from '@/components/admin/DeliveryAddressViewer'
import { useMarkPrizeShipped, useSetPrizeDelivered, useSetSecretPrizeDescription } from '@/hooks/admin/useMarkPrizeShipped'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/Skeleton'

const shipLabels: Record<string, string> = {
  pending: 'очікує',
  awaiting_delivery: 'чекаємо доставки',
  shipped: 'відправлено',
  delivered: 'отримано',
}

export function PrizesTable({
  rows,
  isLoading,
  seasons,
}: {
  rows: AdminSeasonPrizeRow[]
  isLoading: boolean
  seasons: { id: string; number: number; title: string }[]
}) {
  const [selSeason, setSelSeason] = useState<string>('')
  const [selPlace, setSelPlace] = useState<string>('')
  const [selStatus, setSelStatus] = useState<string>('')
  const [detail, setDetail] = useState<AdminSeasonPrizeRow | null>(null)
  const [track, setTrack] = useState('')
  const [secret, setSecret] = useState('')

  const markShip = useMarkPrizeShipped()
  const setDel = useSetPrizeDelivered()
  const setSecretR = useSetSecretPrizeDescription()

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (selSeason && r.season_id !== selSeason) return false
      if (selPlace && String(r.place) !== selPlace) return false
      if (selStatus && r.shipping_status !== selStatus) return false
      return true
    })
  }, [rows, selSeason, selPlace, selStatus])

  if (isLoading) return <Skeleton className="h-64" />

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <label className="text-rose-dust">
          Сезон
          <select
            className="ml-2 rounded border border-white/15 bg-bg-base px-2 py-1 text-rose-cream"
            value={selSeason}
            onChange={(e) => setSelSeason(e.target.value)}
          >
            <option value="">всі</option>
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.number} — {s.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-rose-dust">
          Місце
          <select
            className="ml-2 rounded border border-white/15 bg-bg-base px-2 py-1 text-rose-cream"
            value={selPlace}
            onChange={(e) => setSelPlace(e.target.value)}
          >
            <option value="">всі</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </label>
        <label className="text-rose-dust">
          Статус
          <select
            className="ml-2 rounded border border-white/15 bg-bg-base px-2 py-1 text-rose-cream"
            value={selStatus}
            onChange={(e) => setSelStatus(e.target.value)}
          >
            <option value="">всі</option>
            <option value="pending">pending</option>
            <option value="awaiting_delivery">awaiting_delivery</option>
            <option value="shipped">shipped</option>
            <option value="delivered">delivered</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-rose-dust">
              <th className="px-2 py-2">Сезон</th>
              <th>Користувач</th>
              <th>Місце</th>
              <th>Трофей</th>
              <th>Форма</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer border-t border-white/5 hover:bg-white/5"
                onClick={() => {
                  setDetail(r)
                  setTrack(r.shipping_tracking_number ?? '')
                  setSecret(r.secret_prize_description ?? '')
                }}
              >
                <td className="px-2 py-2 font-mono text-xs text-rose-dust/90">
                  {r.seasons ? `${r.seasons.number}` : '—'}
                </td>
                <td>{r.profiles?.nickname ?? r.user_id}</td>
                <td className="font-mono">{r.place}</td>
                <td className="max-w-[180px] truncate" title={r.trophy_title}>
                  {r.trophy_title}
                </td>
                <td className="text-xs text-rose-dust">
                  {r.delivery_submitted_at
                    ? new Date(r.delivery_submitted_at).toLocaleString('uk-UA')
                    : '—'}
                </td>
                <td className="text-xs">{shipLabels[r.shipping_status] ?? r.shipping_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 ? <p className="mt-4 text-rose-dust">Порожньо</p> : null}

      {detail ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center"
          onClick={() => setDetail(null)}
          role="presentation"
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/15 bg-bg-card p-6"
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-serif text-xl text-rose-cream">Приз: {detail.trophy_title}</h3>
            <p className="text-xs text-rose-dust">
              {detail.profiles?.nickname ?? '—'} · місце {detail.place}
            </p>
            <div className="mt-4">
              <p className="text-xs uppercase text-rose-dust/80">Адреса</p>
              <DeliveryAddressViewer row={detail} />
            </div>
            <div className="mt-4">
              <label className="text-xs text-rose-dust">Секретний приз (бачить гравець після «Доставлено»)</label>
              <textarea
                className="mt-1 w-full rounded border border-white/15 bg-bg-base p-2 text-sm text-rose-cream"
                rows={3}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
              <button
                type="button"
                className="mt-2 text-sm text-primary-live underline"
                onClick={async () => {
                  try {
                    await setSecretR.mutateAsync({ prizeId: detail.id, description: secret })
                    toast.success('Опис збережено')
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Помилка')
                  }
                }}
              >
                Зберегти опис
              </button>
            </div>
            <div className="mt-4">
              <label className="text-xs text-rose-dust">Трек-номер</label>
              <input
                className="mt-1 w-full rounded border border-white/15 bg-bg-base p-2 font-mono text-sm"
                value={track}
                onChange={(e) => setTrack(e.target.value)}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded bg-primary px-3 py-1.5 text-sm text-white"
                  onClick={async () => {
                    try {
                      await markShip.mutateAsync({ prizeId: detail.id, tracking: track })
                      toast.success('Позначено відправленим')
                      setDetail({ ...detail, shipping_status: 'shipped', shipping_tracking_number: track })
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Помилка')
                    }
                  }}
                >
                  Позначити відправленим
                </button>
                <button
                  type="button"
                  className="rounded border border-white/20 px-3 py-1.5 text-sm"
                  onClick={async () => {
                    try {
                      await setDel.mutateAsync(detail.id)
                      toast.success('Статус: доставлено')
                      setDetail({ ...detail, shipping_status: 'delivered' })
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'Помилка')
                    }
                  }}
                >
                  Позначити доставлено
                </button>
                <button type="button" className="rounded border border-white/20 px-3 py-1.5 text-sm" onClick={() => setDetail(null)}>
                  Закрити
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
