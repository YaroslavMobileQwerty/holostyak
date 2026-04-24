import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Json } from '@/lib/database.types'

export function useAppSettings() {
  return useQuery({
    queryKey: ['appSettings'],
    staleTime: 15 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from('app_settings').select('key, value')
      if (error) throw error
      return Object.fromEntries((data ?? []).map((r) => [r.key, r.value])) as Record<string, Json>
    },
  })
}
