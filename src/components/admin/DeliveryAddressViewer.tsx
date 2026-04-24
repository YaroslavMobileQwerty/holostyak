import { toast } from 'sonner'
import type { AdminSeasonPrizeRow } from '@/hooks/admin/useSeasonPrizes'
import { formatPrizeAddress } from '@/lib/prizeAddress'

export function DeliveryAddressViewer({ row }: { row: AdminSeasonPrizeRow }) {
  const text = formatPrizeAddress(row)
  return (
    <div>
      <p className="whitespace-pre-wrap break-words text-sm text-rose-cream/95">{text}</p>
      <button
        type="button"
        className="mt-2 text-sm text-primary-live underline"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text)
            toast.success('Скопійовано в буфер')
          } catch {
            toast.error('Не вдалося скопіювати')
          }
        }}
      >
        Копіювати
      </button>
    </div>
  )
}
