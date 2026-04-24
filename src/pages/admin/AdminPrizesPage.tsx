import { useAdminSeasons } from '@/hooks/admin/useAdminCatalog'
import { useSeasonPrizes } from '@/hooks/admin/useSeasonPrizes'
import { PrizesTable } from '@/components/admin/PrizesTable'

export function AdminPrizesPage() {
  const { data: seasonRows, isLoading: sLoading } = useAdminSeasons()
  const { data: prizeRows, isLoading: pLoading } = useSeasonPrizes()
  const seasons = (seasonRows ?? []).map((s) => ({ id: s.id, number: s.number, title: s.title }))

  return (
    <div>
      <h1 className="font-serif text-3xl text-rose-cream">Призи сезону</h1>
      <p className="mt-1 text-sm text-rose-dust">Топ-3 після фіналізації сезону, форми доставки та трек.</p>

      <section className="mt-6 rounded border border-amber-500/20 bg-amber-950/20 p-4 text-sm text-amber-100/90">
        <h2 className="font-medium text-amber-100">Як обробляти призи</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Дочекайся форми доставки від гравця (сповіщення в колоколі та на цій сторінці).</li>
          <li>Перевір реквізити та внутрішній опис «секретного сюрпризу» (гравець побачить після доставки).</li>
          <li>Відправ посилку, встав трекінг — гравцю прийде нотифікація.</li>
          <li>Коли отримав підтвердження — натисни «Позначити доставлено», щоб розкрити сюрприз.</li>
        </ol>
      </section>

      <div className="mt-8">
        <PrizesTable
          rows={prizeRows ?? []}
          isLoading={pLoading || sLoading}
          seasons={seasons}
        />
      </div>
    </div>
  )
}
