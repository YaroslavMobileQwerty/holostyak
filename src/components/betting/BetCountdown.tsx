import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { uk } from 'date-fns/locale'
import { CountdownDigits } from '@/motion/CountdownDigits'

function urgencyClass(closesAt: string, now: number): string {
  const end = new Date(closesAt).getTime()
  const left = end - now
  if (left <= 0) return 'text-rose-400'
  if (left < 10 * 60 * 1000) return 'text-rose-400'
  if (left < 60 * 60 * 1000) return 'text-amber-200'
  return 'text-emerald-300/90'
}

export function BetCountdown({ closesAt }: { closesAt: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const end = new Date(closesAt).getTime()
  if (end <= now) {
    return <span className="text-rose-400">Прийом завершено</span>
  }

  return (
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-4">
      <CountdownDigits closesAt={closesAt} now={now} />
      <span className={`text-sm font-medium ${urgencyClass(closesAt, now)}`}>
        {formatDistanceToNow(new Date(closesAt), { addSuffix: true, locale: uk })}
      </span>
    </div>
  )
}
