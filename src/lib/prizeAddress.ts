import type { AdminSeasonPrizeRow } from '@/hooks/admin/useSeasonPrizes'

export function formatPrizeAddress(row: AdminSeasonPrizeRow) {
  if (!row.delivery_submitted_at) return 'Ще не надіслано'
  const parts = [
    [row.delivery_first_name, row.delivery_last_name].filter(Boolean).join(' '),
    row.delivery_phone,
    row.delivery_carrier,
    row.delivery_city,
    row.delivery_branch_number && `відд. ${row.delivery_branch_number}`,
    row.delivery_address,
  ]
    .map((p) => (typeof p === 'string' ? p.trim() : p))
    .filter(Boolean) as string[]
  return parts.join(' · ') || '—'
}
