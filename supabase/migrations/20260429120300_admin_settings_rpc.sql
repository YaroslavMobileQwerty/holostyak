create or replace function public.admin_update_app_setting(p_key text, p_value jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allowed text[] := array[
    'donation_jar_url', 'donation_card', 'donation_disclaimer', 'donation_qr_url',
    'bet_close_minutes', 'active_season_id'
  ];
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if not (p_key = any (v_allowed)) then raise exception 'Key not editable via RPC'; end if;

  insert into public.app_settings (key, value, updated_by, updated_at)
  values (p_key, p_value, auth.uid(), now())
  on conflict (key) do update set
    value = excluded.value,
    updated_by = excluded.updated_by,
    updated_at = excluded.updated_at;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(), 'app_setting_updated', 'app_settings', null,
    jsonb_build_object('key', p_key, 'value', p_value)
  );
end;
$$;

grant execute on function public.admin_update_app_setting(text, jsonb) to authenticated;
