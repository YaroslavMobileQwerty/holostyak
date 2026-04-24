import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { DonationInfoBlock } from '@/components/coins/DonationInfoBlock'
import { ZsuBanner } from '@/components/coins/ZsuBanner'
import { PurchaseRequestForm } from '@/components/coins/PurchaseRequestForm'
import { PurchaseStatusCard } from '@/components/coins/PurchaseStatusCard'
import { usePurchaseRequests } from '@/hooks/usePurchaseRequests'
import { Skeleton } from '@/components/ui/Skeleton'

export function CoinsPage() {
  const { isAuthenticated } = useAuth()
  const { data: requests, isLoading } = usePurchaseRequests()

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="font-serif text-4xl text-rose-cream">Донат і бали</h1>
      <div className="mt-4">
        <ZsuBanner />
      </div>
      <div className="mt-8">
        <DonationInfoBlock />
      </div>

      {!isAuthenticated ? (
        <section className="mt-10 rounded-2xl border border-primary/30 bg-bg-card p-6 text-center">
          <p className="text-rose-dust">Увійдіть, щоб подати заявку на нарахування балів після донату.</p>
          <Link
            to="/login"
            state={{ from: '/coins' }}
            data-testid="coins-guest-login"
            className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hot"
          >
            Увійти
          </Link>
        </section>
      ) : (
        <>
          <PurchaseRequestForm />
          <section className="mt-10">
            <h2 className="font-serif text-2xl text-rose-cream">Ваші заявки</h2>
            {isLoading ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : requests?.length ? (
              <ul className="mt-4 space-y-3">
                {requests.map((r) => (
                  <li key={r.id}>
                    <PurchaseStatusCard row={r} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-rose-dust">Поки що немає заявок.</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}
