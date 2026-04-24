import { useAuthInit } from '@/hooks/useAuth'
import { Router } from './router'

function AuthBootstrap() {
  useAuthInit()
  return null
}

export default function App() {
  return (
    <>
      <AuthBootstrap />
      <Router />
    </>
  )
}
