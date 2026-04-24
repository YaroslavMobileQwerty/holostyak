alter table public.bet_events enable row level security;
alter table public.bet_options enable row level security;
alter table public.bets enable row level security;

create policy "bet_events_select_all"
  on public.bet_events for select
  using (true);

create policy "bet_options_select_all"
  on public.bet_options for select
  using (true);

create policy "bet_events_admin_write"
  on public.bet_events for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "bet_options_admin_write"
  on public.bet_options for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "bets_select_own_or_admin"
  on public.bets for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());
