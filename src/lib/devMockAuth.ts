import type { Session, User } from '@supabase/supabase-js'
import { isDemoMode } from '@/lib/demoMode'
import { getDemoProfile } from '@/lib/demoPublicData'
import type { Database } from '@/lib/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Dev-only: fake «logged in» in UI when `VITE_DEV_MOCK_USER_ID` is a valid UUID and there is no real Supabase session.
 * The JS client does not get a real JWT; private RPC / RLS may still fail until you sign in for real.
 */
export function isDevMockAuthConfigValid(): boolean {
  if (!import.meta.env.DEV) return false
  const v = import.meta.env.VITE_DEV_MOCK_USER_ID
  if (typeof v !== 'string' || !v.trim()) return false
  return UUID_RE.test(v.trim())
}

function buildMockUser(id: string): User {
  return {
    id: id.trim(),
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: { mock: true },
    created_at: new Date().toISOString(),
  } as User
}

/** `Session` for `useAuth` when faking auth; not a real JWT. */
export function getDevMockAuthSession(): Session | null {
  if (!isDevMockAuthConfigValid()) return null
  const id = import.meta.env.VITE_DEV_MOCK_USER_ID!.trim()
  const u = buildMockUser(id)
  return {
    access_token: 'dev-mock',
    refresh_token: 'dev-mock',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: u,
  } as Session
}

/** In-memory `profiles` row for UI when there is no real JWT. */
export function getDevMockProfileRow(userId: string): ProfileRow {
  if (isDemoMode()) {
    const row = getDemoProfile(userId.trim())
    if (row) return row
  }
  return {
    id: userId.trim(),
    nickname: 'Dev UI',
    avatar_url: null,
    balance: 0,
    correct_bets: 0,
    total_bets: 0,
    total_won: 0,
    streak_best: 0,
    streak_current: 0,
    role: 'user',
    is_banned: false,
    created_at: new Date().toISOString(),
  }
}
