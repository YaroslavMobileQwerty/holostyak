import { toast } from 'sonner'
import { useAppSettings } from '@/hooks/useAppSettings'
import { stringFromAppSetting } from '@/lib/appSettingValue'
import { Skeleton } from '@/components/ui/Skeleton'

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success('Скопійовано')
  } catch {
    toast.error('Не вдалося скопіювати')
  }
}

export function DonationInfoBlock() {
  const { data, isLoading } = useAppSettings()

  if (isLoading)
    return (
      <div className="space-y-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-10" />
      </div>
    )

  const jar = stringFromAppSetting(data?.donation_jar_url ?? null)
  const card = stringFromAppSetting(data?.donation_card ?? null)
  const disclaimer = stringFromAppSetting(data?.donation_disclaimer ?? null)
  const qr = stringFromAppSetting(data?.donation_qr_url ?? null)

  return (
    <section className="rounded-2xl border border-white/10 bg-bg-card p-6">
      <h2 className="font-serif text-2xl text-primary-live">Як задонатити</h2>
      <p className="mt-2 text-sm text-rose-dust">{disclaimer || 'Усі зібрані кошти — на підтримку ЗСУ.'}</p>

      {qr ? (
        <div className="mt-6 flex justify-center">
          <img src={qr} alt="QR для донату" className="max-h-48 rounded-lg border border-white/10" />
        </div>
      ) : (
        <p className="mt-4 text-xs text-rose-dust/70">QR-код зʼявиться тут після налаштування адміністратором.</p>
      )}

      <div className="mt-6 space-y-3">
        {jar ? (
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={jar}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary-live underline-offset-4 hover:underline"
            >
              Банка Monobank
            </a>
            <button
              type="button"
              onClick={() => void copyText(jar)}
              className="rounded-lg border border-white/15 px-3 py-1 text-xs text-rose-dust hover:border-primary-live hover:text-primary-live"
            >
              Копіювати посилання
            </button>
          </div>
        ) : null}
        {card ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-rose-cream">{card}</span>
            <button
              type="button"
              onClick={() => void copyText(card)}
              className="rounded-lg border border-white/15 px-3 py-1 text-xs text-rose-dust hover:border-primary-live hover:text-primary-live"
            >
              Копіювати картку
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
