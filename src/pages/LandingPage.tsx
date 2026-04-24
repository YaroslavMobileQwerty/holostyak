import { Link } from 'react-router-dom'
import { useActiveSeason } from '@/hooks/useActiveSeason'
import { useBachelors } from '@/hooks/useBachelors'

export function LandingPage() {
  const { data: season } = useActiveSeason()
  const { data: bachelors } = useBachelors(season?.id)

  return (
    <div className="py-10">
      <section className="text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary-live">
          {season?.title ?? 'Холостяк'}
        </p>
        <h1 className="font-serif text-5xl leading-none md:text-7xl">
          Зроби свою ставку.
          <br />
          <em className="text-primary-live">На кохання.</em>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-rose-dust">
          Віртуальний тоталізатор на шоу Холостяк. Усі зібрані кошти — на підтримку ЗСУ.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-block rounded-xl bg-primary px-8 py-3 font-medium transition hover:bg-primary-hot"
        >
          Увійти та грати
        </Link>
      </section>

      {bachelors && bachelors.length > 0 && (
        <section className="mt-20 grid grid-cols-1 gap-4 md:grid-cols-2">
          {bachelors.map((b) => (
            <div key={b.id} className="rounded-2xl border border-primary/20 bg-bg-card p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-primary-live">
                Холостяк #{b.order_index}
              </p>
              <h2 className="mt-2 font-serif text-3xl">{b.name}</h2>
              {b.bio && <p className="mt-3 text-sm text-rose-dust">{b.bio}</p>}
            </div>
          ))}
        </section>
      )}

      <section className="mt-20">
        <h2 className="font-serif text-3xl">Як це працює</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          <li className="rounded-2xl border border-white/10 bg-bg-card p-6">
            <div className="mb-2 text-xs text-primary-live">КРОК 1</div>
            <h3 className="font-serif text-xl">Купи бали</h3>
            <p className="mt-2 text-sm text-rose-dust">
              Донат до благодійної банки monobank. 1 грн = 1 бал. 100% → ЗСУ.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-bg-card p-6">
            <div className="mb-2 text-xs text-primary-live">КРОК 2</div>
            <h3 className="font-serif text-xl">Обери випуск</h3>
            <p className="mt-2 text-sm text-rose-dust">
              Щотижня нові події. Елімінації, перші троянди, побачення.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-bg-card p-6">
            <div className="mb-2 text-xs text-primary-live">КРОК 3</div>
            <h3 className="font-serif text-xl">Зроби ставку</h3>
            <p className="mt-2 text-sm text-rose-dust">
              Вгадав — вигра́в бали. Найкращим — трофей і приз у кінці сезону.
            </p>
          </li>
        </ol>
      </section>
    </div>
  )
}
