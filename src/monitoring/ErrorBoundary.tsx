import * as Sentry from '@sentry/react'

function Fallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-base px-4 text-center">
      <p className="font-serif text-2xl text-rose-cream">Щось пішло не так</p>
      <p className="max-w-md text-sm text-rose-dust">Спробуйте оновити сторінку.</p>
      <button
        type="button"
        className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hot"
        onClick={() => window.location.reload()}
      >
        Оновити
      </button>
    </div>
  )
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <Sentry.ErrorBoundary fallback={<Fallback />} showDialog={false}>
      {children}
    </Sentry.ErrorBoundary>
  )
}
