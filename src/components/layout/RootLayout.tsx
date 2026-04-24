import { PublicHeader } from './PublicHeader'
import { MobileBottomNav } from './MobileBottomNav'
import { Footer } from './Footer'
import { PageTransition } from '@/motion/PageTransition'

export function RootLayout() {
  return (
    <>
      <PublicHeader />
      <main className="mx-auto min-h-[calc(100vh-140px)] max-w-6xl px-4 pb-24 md:pb-8">
        <PageTransition />
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  )
}
