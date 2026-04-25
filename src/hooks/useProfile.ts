import { useQuery } from '@tanstack/react-query'
import { getDevMockProfileRow } from '@/lib/devMockAuth'
import { isDemoMode } from '@/lib/demoMode'
import { getDemoProfile } from '@/lib/demoPublicData'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user, isDevAuthMock } = useAuth()
  return useQuery({
    queryKey: ['profile', user?.id, isDevAuthMock ? 'dev-mock' : 'live'],
    enabled: !!user?.id,
    queryFn: async () => {
      if (isDemoMode()) {
        const row = getDemoProfile(user!.id)
        if (row) return row
      }
      if (isDevAuthMock) {
        return getDevMockProfileRow(user!.id)
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .single()
      if (error) throw error
      return data
    },
  })
}
