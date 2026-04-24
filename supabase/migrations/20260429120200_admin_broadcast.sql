create table public.admin_broadcast_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id),
  title text not null,
  body text not null,
  filter jsonb not null,
  recipient_count int not null,
  created_at timestamptz not null default now()
);
create index admin_broadcast_log_created_idx on public.admin_broadcast_log (created_at desc);

alter table public.admin_broadcast_log enable row level security;
create policy "admin_broadcast_log_select"
  on public.admin_broadcast_log for select to authenticated
  using (public.is_admin());

create or replace function public.admin_broadcast_preview_count(p_filter jsonb)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;

  select count(*)::int into v_count
  from (
    select p.id as user_id from public.profiles p
    where not p.is_banned
      and coalesce((p_filter->>'all')::boolean, false)
    union
    select distinct b.user_id from public.bets b
    where b.placed_at >= now() - interval '24 hours'
      and coalesce((p_filter->>'active_bettors')::boolean, false)
    union
    select distinct b.user_id
    from public.bets b
    inner join public.bet_events e on e.id = b.event_id
    inner join public.episodes ep on ep.id = e.episode_id
    where coalesce((p_filter->>'participated')::boolean, false)
      and p_filter->>'season_id' is not null
      and ep.season_id = (p_filter->>'season_id')::uuid
  ) u;

  return coalesce(v_count, 0);
end;
$$;

create or replace function public.admin_broadcast_notification(
  p_title text,
  p_body text,
  p_filter jsonb
) returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
  v_uid uuid;
begin
  v_uid := auth.uid();
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if p_title is null or length(trim(p_title)) < 1 then
    raise exception 'Title required';
  end if;
  if p_body is null or length(trim(p_body)) < 1 then
    raise exception 'Body required';
  end if;
  if exists (select 1 from public.admin_broadcast_log where created_at > now() - interval '1 hour') then
    raise exception 'broadcast_rate_limited';
  end if;

  insert into public.notifications (user_id, type, title, body)
  select u.user_id, 'admin_message', p_title, p_body
  from (
    select p.id as user_id from public.profiles p
    where not p.is_banned
      and coalesce((p_filter->>'all')::boolean, false)
    union
    select distinct b.user_id from public.bets b
    where b.placed_at >= now() - interval '24 hours'
      and coalesce((p_filter->>'active_bettors')::boolean, false)
    union
    select distinct b.user_id
    from public.bets b
    inner join public.bet_events e on e.id = b.event_id
    inner join public.episodes ep on ep.id = e.episode_id
    where coalesce((p_filter->>'participated')::boolean, false)
      and p_filter->>'season_id' is not null
      and ep.season_id = (p_filter->>'season_id')::uuid
  ) u;
  get diagnostics v_count = row_count;

  insert into public.admin_broadcast_log (admin_id, title, body, filter, recipient_count)
  values (v_uid, p_title, p_body, p_filter, coalesce(v_count, 0));

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    v_uid, 'admin_broadcast', 'notification', null,
    jsonb_build_object('title', p_title, 'body', p_body, 'filter', p_filter, 'recipient_count', v_count)
  );

  return coalesce(v_count, 0);
end;
$$;

revoke all on function public.admin_broadcast_preview_count(jsonb) from public;
grant execute on function public.admin_broadcast_preview_count(jsonb) to authenticated;
grant execute on function public.admin_broadcast_notification(text, text, jsonb) to authenticated;
