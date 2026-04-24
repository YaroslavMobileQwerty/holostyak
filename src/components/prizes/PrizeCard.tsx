import { useState } from 'react'
import { TrophyBadge } from '@/components/prizes/TrophyBadge'
import { SecretPrizeRevealCard } from '@/components/prizes/SecretPrizeRevealCard'
import { DeliveryFormModal } from '@/components/prizes/DeliveryFormModal'
import type { MyPrizeRow } from '@/hooks/useMyPrizes'

const statusLabel: Record<string, string> = {
  pending: 'Очікуємо адресу',
  awaiting_delivery: 'Адреса надіслана, чекаємо відправки',
  shipped: 'Відправлено',
  delivered: 'Доставлено',
}

function trackingHref(carrier: string | null, tracking: string | null) {
  if (!tracking?.trim()) return null
  const t = tracking.trim()
  if (carrier === 'nova_poshta') {
    return `https://novaposhta.ua/tracking?cargo_number=${encodeURIComponent(t)}`
  }
  if (carrier === 'ukr_poshta') {
    return `https://track.ukrposhta.ua/`
  }
  return null
}

export function PrizeCard({ row }: { row: MyPrizeRow }) {
  const [open, setOpen] = useState(false)
  const place = row.place as 1 | 2 | 3
  const th = trackingHref(row.delivery_carrier, row.shipping_tracking_number)

  return (
    <article className="rounded-2xl border border-white/10 bg-bg-card/80 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <TrophyBadge place={place} />
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-2xl text-rose-cream">{row.trophy_title}</h2>
          {row.seasons ? (
            <p className="mt-1 text-sm text-rose-dust">
              Сезон {row.seasons.number} · {row.seasons.title}
            </p>
          ) : null}

          {row.delivery_submitted_at == null ? (
            <div className="mt-4">
              <p className="text-sm text-rose-dust">Щоб отримати фізичний приз, заповни доставку.</p>
              <button
                type="button"
                className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
                onClick={() => setOpen(true)}
              >
                Заповнити доставку
              </button>
            </div>
          ) : (
            <div className="mt-4 text-sm text-rose-cream/90">
              <p>
                <span className="text-rose-dust">Статус: </span>
                {statusLabel[row.shipping_status] ?? row.shipping_status}
              </p>
              {row.shipping_status === 'shipped' && row.shipping_tracking_number ? (
                <p className="mt-2 break-all font-mono text-xs text-primary-live">
                  Трек-номер:{' '}
                  {th ? (
                    <a href={th} className="underline" target="_blank" rel="noreferrer">
                      {row.shipping_tracking_number}
                    </a>
                  ) : (
                    row.shipping_tracking_number
                  )}
                </p>
              ) : null}
            </div>
          )}

          <SecretPrizeRevealCard
            shippingStatus={row.shipping_status}
            description={
              row.shipping_status === 'delivered' ? row.secret_prize_description : null
            }
          />
        </div>
      </div>

      <DeliveryFormModal
        prizeId={row.id}
        open={open}
        onClose={() => setOpen(false)}
        trophyTitle={row.trophy_title}
      />
    </article>
  )
}
