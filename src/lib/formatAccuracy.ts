export function formatAccuracy(correct: number, total: number): string {
  if (total <= 0) return '—'
  return `${Math.round((correct / total) * 1000) / 10}%`
}
