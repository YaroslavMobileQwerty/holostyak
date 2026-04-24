import { Outlet } from 'react-router-dom'
import { PublicHeader } from './PublicHeader'
import { MobileBottomNav } from './MobileBottomNav'
import { Footer } from './Footer'
import { useAuthInit } from '@/hooks/useAuth'

export function RootLayout() {
  useAuthInit()
  return (
    <>
      <PublicHeader />
      <main className="mx-auto min-h-[calc(100vh-140px)] max-w-6xl px-4 pb-24 md:pb-8">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  )
}
