import { useProfile } from '@/hooks/useProfile'

export function useIsAdmin() {
  const q = useProfile()
  return {
    ...q,
    isAdmin: q.data?.role === 'admin',
  }
}
