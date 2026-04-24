import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Props = {
  label: string
  value: number
  to?: string
  linkText?: string
  icon?: ReactNode
}

export function DashboardMetricCard({ label, value, to, linkText, icon }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-rose-dust">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-mono text-3xl text-rose-cream">{value}</p>
      {to && linkText ? (
        <Link
          to={to}
          className="mt-2 inline-block text-sm text-primary-live underline-offset-4 hover:underline"
        >
          {linkText}
        </Link>
      ) : null}
    </div>
  )
}
