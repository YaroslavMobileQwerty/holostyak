import { describe, it, expect, beforeEach } from 'vitest'
import type { Session, User } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/useAuthStore'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ session: null, user: null, isLoading: true })
  })

  it('sets session and user together', () => {
    const fakeSession = { user: { id: 'u1', email: 'a@b.c' } as User } as Session
    useAuthStore.getState().setSession(fakeSession)
    expect(useAuthStore.getState().session).toBe(fakeSession)
    expect(useAuthStore.getState().user?.id).toBe('u1')
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('clears session on null', () => {
    const fakeUser = { id: 'u1' } as User
    useAuthStore.setState({
      session: { user: fakeUser } as Session,
      user: fakeUser,
    })
    useAuthStore.getState().setSession(null)
    expect(useAuthStore.getState().session).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
