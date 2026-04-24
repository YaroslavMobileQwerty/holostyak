alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;

create policy "achievements_select_all"
  on public.achievements for select
  to anon, authenticated
  using (true);

create policy "user_achievements_select_all"
  on public.user_achievements for select
  to anon, authenticated
  using (true);

-- No client insert/update/delete on user_achievements (server grants via SECURITY DEFINER)

create or replace function public.mark_notification_read(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  update public.notifications
  set is_read = true
  where id = p_id and user_id = auth.uid();
end;
$$;

grant execute on function public.mark_notification_read(uuid) to authenticated;
