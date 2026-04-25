/**
 * Dev-only: UI заповнений демо-даними без звернення до Supabase.
 * Потрібен `VITE_DEMO_MODE=true` у .env.local (тільки dev).
 */
export function isDemoMode(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_DEMO_MODE === 'true'
}
