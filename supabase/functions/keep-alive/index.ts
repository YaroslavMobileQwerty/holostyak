/**
 * Keep-alive: lightweight DB touch so hosted Supabase projects pause less often.
 * Deploy: `supabase functions deploy keep-alive`
 * Schedule: external cron (cron-job.org, UptimeRobot, Cloudflare Cron) → POST/GET
 * `https://<project-ref>.supabase.co/functions/v1/keep-alive`
 * with `Authorization: Bearer <anon or service role>` if verify_jwt is true (prefer verify_jwt=false + optional secret header in production).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

Deno.serve(async () => {
  const url = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!url || !key) {
    return new Response('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY', { status: 500 })
  }
  const sb = createClient(url, key)
  const { error } = await sb.from('profiles').select('id', { count: 'exact', head: true })
  if (error) {
    return new Response(error.message, { status: 500 })
  }
  return new Response('ok', { status: 200 })
})
