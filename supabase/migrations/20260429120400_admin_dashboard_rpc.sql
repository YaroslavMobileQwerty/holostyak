create or replace function public.admin_dashboard_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  return jsonb_build_object(
    'pending_purchases', (select count(*)::int from public.coin_purchase_requests where status = 'pending'),
    'pending_resolutions', (select count(*)::int from public.bet_events where status = 'closed'),
    'active_bettors_24h', (
      select count(distinct user_id)::int from public.bets
      where placed_at >= now() - interval '24 hours'
    ),
    'total_staked_24h', (
      select coalesce(sum(amount), 0)::int from public.bets
      where placed_at >= now() - interval '24 hours'
    ),
    'signups_24h', (
      select count(*)::int from public.profiles
      where created_at >= now() - interval '24 hours'
    )
  );
end;
$$;

grant execute on function public.admin_dashboard_stats() to authenticated;
