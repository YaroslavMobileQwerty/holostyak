import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <h1 className="font-serif text-5xl text-primary-live">404</h1>
      <p className="mt-2 text-rose-dust">Сторінку не знайдено</p>
      <Link to="/" className="mt-6 rounded-lg bg-primary px-5 py-2">
        На головну
      </Link>
    </div>
  )
}
