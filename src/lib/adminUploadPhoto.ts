import { supabase } from '@/lib/supabase'

/**
 * Public bucket `participant-photos`; admin RLS on insert.
 * Returns a public URL suitable for `photo_url` / settings JSON.
 */
export async function uploadParticipantPhoto(file: File): Promise<string> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getUser()
  if (sessionError) throw sessionError
  const uid = sessionData.user?.id
  if (!uid) throw new Error('Not authenticated')
  const safe = file.name.replaceAll(/[^a-zA-Z0-9.]/g, '_')
  const path = `${uid}/${Date.now()}-${safe}`
  const { error: up } = await supabase.storage.from('participant-photos').upload(path, file, {
    upsert: false,
  })
  if (up) throw up
  const { data: pub } = supabase.storage.from('participant-photos').getPublicUrl(path)
  return pub.publicUrl
}
