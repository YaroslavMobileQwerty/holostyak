import { useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useActiveSeason } from '@/hooks/useActiveSeason'
import { useBachelors } from '@/hooks/useBachelors'
import { ZsuBanner } from '@/components/coins/ZsuBanner'
import { HeroText } from '@/motion/HeroText'

export function LandingPage() {
  const reducedMotion = !!useReducedMotion()
  const { data: season } = useActiveSeason()
  const { data: bachelors } = useBachelors(season?.id)

  return (
    <div className="py-10">
      <ZsuBanner />
      <section className="mt-8 text-center">
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-primary-live">
          {season?.title ?? 'Холостяк'}
        </p>
        <HeroText reducedMotion={reducedMotion} />
        <p className="mx-auto mt-4 max-w-xl text-rose-dust">
          Віртуальний тоталізатор на шоу Холостяк. Усі зібрані кошти — на підтримку ЗСУ.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-block rounded-xl bg-primary px-8 py-3 font-medium text-white transition hover:bg-primary-hot"
        >
          Увійти та грати
        </Link>
      </section>

      {bachelors && bachelors.length > 0 && (
        <section
          className={`mt-20 grid grid-cols-1 gap-4 ${bachelors.length > 1 ? 'md:grid-cols-2' : 'mx-auto max-w-md'}`}
        >
          {bachelors.map((b) => (
            <div
              key={b.id}
              className="overflow-hidden rounded-2xl border border-primary/20 bg-bg-card"
            >
              {b.photo_url ? (
                <img
                  src={b.photo_url}
                  alt={b.name}
                  className="aspect-[3/4] w-full object-cover object-top"
                />
              ) : (
                <div className="aspect-[3/4] bg-gradient-to-br from-burgundy to-bg-elevated" />
              )}
              <div className="p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-primary-live">
                  Холостяк #{b.order_index}
                </p>
                <h2 className="mt-2 font-serif text-3xl">{b.name}</h2>
                {b.bio && <p className="mt-3 text-sm text-rose-dust">{b.bio}</p>}
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="mt-20">
        <h2 className="font-serif text-3xl">Як це працює</h2>
        <ol className="mt-6 grid gap-4 md:grid-cols-3">
          <li className="rounded-2xl border border-white/10 bg-bg-card p-6">
            <div className="mb-2 text-xs text-primary-live">КРОК 1</div>
            <h3 className="font-serif text-xl text-rose-cream">Купи бали</h3>
            <p className="mt-2 text-sm text-rose-cream/85">
              Донат до благодійної банки monobank. 1 грн = 1 бал. 100% → ЗСУ.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-bg-card p-6">
            <div className="mb-2 text-xs text-primary-live">КРОК 2</div>
            <h3 className="font-serif text-xl text-rose-cream">Обери випуск</h3>
            <p className="mt-2 text-sm text-rose-cream/85">
              Щотижня нові події. Елімінації, перші троянди, побачення.
            </p>
          </li>
          <li className="rounded-2xl border border-white/10 bg-bg-card p-6">
            <div className="mb-2 text-xs text-primary-live">КРОК 3</div>
            <h3 className="font-serif text-xl text-rose-cream">Зроби ставку</h3>
            <p className="mt-2 text-sm text-rose-cream/85">
              Вгадав — вигра́в бали. Найкращим — трофей і приз у кінці сезону.
            </p>
          </li>
        </ol>
      </section>
    </div>
  )
}
