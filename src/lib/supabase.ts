import { createClient } from '@supabase/supabase-js'
import { isDemoMode } from './demoMode'
import type { Database } from './database.types'

const url =
  import.meta.env.VITE_SUPABASE_URL || (isDemoMode() ? 'https://local-demo.invalid' : '')
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || (isDemoMode() ? 'local-demo-anon-key' : '')

if (!url || !anonKey) {
  throw new Error(
    'Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
      '(local: .env.local, production: Cloudflare Pages env vars) or enable VITE_DEMO_MODE=true in dev.',
  )
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
