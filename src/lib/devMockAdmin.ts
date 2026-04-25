/** Dev-only: treat current user as admin in UI / routing (DB RPCs still enforce real `role`). */
export function isDevMockAdminEnabled(): boolean {
  if (!import.meta.env.DEV) return false
  const v = import.meta.env.VITE_DEV_MOCK_ADMIN
  return v === 'true' || v === '1'
}
