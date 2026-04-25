import { useAuthInit } from '@/hooks/useAuth'
import { isDemoMode } from '@/lib/demoMode'
import { Router } from './router'

function AuthBootstrap() {
  useAuthInit()
  return null
}

function DemoModeBanner() {
  if (!isDemoMode()) return null
  return (
    <div className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-center text-xs text-amber-100/90">
      Демо UI без Supabase (фікстури в коді). Вимкніть{' '}
      <code className="font-mono text-amber-50/90">VITE_DEMO_MODE</code> для реального бекенду.
    </div>
  )
}

export default function App() {
  return (
    <>
      <AuthBootstrap />
      <DemoModeBanner />
      <Router />
    </>
  )
}
