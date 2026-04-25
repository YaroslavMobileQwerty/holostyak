import { isDevMockAdminEnabled } from '@/lib/devMockAdmin'
import { useProfile } from '@/hooks/useProfile'

export function useIsAdmin() {
  const q = useProfile()
  return {
    ...q,
    isAdmin: isDevMockAdminEnabled() || q.data?.role === 'admin',
  }
}
