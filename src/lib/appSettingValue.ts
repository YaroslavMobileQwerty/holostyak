import type { Json } from '@/lib/database.types'

/** JSONB scalar from app_settings → display string */
export function stringFromAppSetting(value: Json): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}
