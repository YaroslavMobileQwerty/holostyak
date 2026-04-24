import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useSignedScreenshotUrl(path: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ['signedScreenshot', path],
    enabled: Boolean(path && enabled),
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from('screenshots')
        .createSignedUrl(path!, 3600)
      if (error) throw error
      return data.signedUrl
    },
  })
}
