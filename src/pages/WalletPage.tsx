import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { ZsuBanner } from '@/components/coins/ZsuBanner'
import { BalanceCard } from '@/components/wallet/BalanceCard'
import { LedgerList } from '@/components/wallet/LedgerList'
import { Skeleton } from '@/components/ui/Skeleton'

export function WalletPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { data: profile, isLoading: profileLoading } = useProfile()

  if (authLoading)
    return (
      <div className="py-10">
        <Skeleton className="h-40" />
      </div>
    )
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: '/wallet' }} replace />

  return (
    <div className="mx-auto max-w-4xl py-10">
      <h1 className="font-serif text-4xl text-rose-cream">Гаманець</h1>
      <div className="mt-4">
        <ZsuBanner />
      </div>
      <div className="mt-8">
        <BalanceCard balance={profile?.balance} isLoading={profileLoading} />
      </div>
      <LedgerList />
    </div>
  )
}
