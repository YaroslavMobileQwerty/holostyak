import { useQuery } from '@tanstack/react-query'
import { isDemoMode } from '@/lib/demoMode'
import { getDemoAppSettings } from '@/lib/demoPublicData'
import { supabase } from '@/lib/supabase'
import type { Json } from '@/lib/database.types'

export function useAppSettings() {
  return useQuery({
    queryKey: ['appSettings'],
    staleTime: 15 * 60 * 1000,
    queryFn: async () => {
      if (isDemoMode()) return getDemoAppSettings() as Record<string, Json>
      const { data, error } = await supabase.from('app_settings').select('key, value')
      if (error) throw error
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, Json>
    },
  })
}
