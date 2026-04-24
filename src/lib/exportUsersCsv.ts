export type UserCsvRow = {
  id: string
  nickname: string | null
  email: string
  role: string
  is_banned: boolean
  balance: number
  total_bets: number
  correct_bets: number
  created_at: string
}

const headers = [
  'id',
  'nickname',
  'email',
  'role',
  'is_banned',
  'balance',
  'total_bets',
  'correct_bets',
  'created_at',
] as const

function escapeField(v: string) {
  if (v.includes(',') || v.includes('"') || v.includes('\n') || v.includes('\r')) {
    return `"${v.replaceAll('"', '""')}"`
  }
  return v
}

export function exportUsersCsv(rows: UserCsvRow[]): string {
  const lines: string[] = [headers.join(',')]
  for (const r of rows) {
    const line = [
      r.id,
      r.nickname ?? '',
      r.email,
      r.role,
      r.is_banned ? '1' : '0',
      String(r.balance),
      String(r.total_bets),
      String(r.correct_bets),
      r.created_at,
    ].map((x) => escapeField(x))
    lines.push(line.join(','))
  }
  return lines.join('\n') + (lines.length > 1 ? '\n' : '')
}
