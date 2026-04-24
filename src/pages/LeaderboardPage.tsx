export function LeaderboardPage() {
  return (
    <div className="py-10">
      <h1 className="font-serif text-4xl">Лідерборд</h1>
      <p className="mt-2 text-rose-dust">Топ прогнозистів сезону.</p>

      <div className="mt-10 rounded-2xl border border-white/10 bg-bg-card p-8 text-center">
        <p className="font-serif text-2xl text-rose-dust">Поки порожньо</p>
        <p className="mt-2 text-sm text-rose-dust/70">
          Лідерборд наповниться коли почнуться ставки у Фазі 3.
        </p>
      </div>
    </div>
  )
}
