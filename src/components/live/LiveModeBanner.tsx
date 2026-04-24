import { Link } from 'react-router-dom'

export function LiveModeBanner() {
  return (
    <div className="mb-6 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm text-rose-cream">
      <span className="font-medium text-primary-live">Ефір зараз у прямому ефірі.</span>{' '}
      <button
        type="button"
        className="text-primary-live underline-offset-4 hover:underline"
        onClick={() => document.getElementById('lightning-panel')?.scrollIntoView({ behavior: 'smooth' })}
      >
        Блискавки
      </button>
      {' · '}
      <Link to="/episodes" className="text-primary-live underline-offset-4 hover:underline">
        Усі випуски
      </Link>
    </div>
  )
}
