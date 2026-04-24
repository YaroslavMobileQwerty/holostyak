-- RLS: season_prizes — read own row or all as admin; no direct DML

alter table public.season_prizes enable row level security;

create policy "season_prizes_select_own"
  on public.season_prizes
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "season_prizes_select_admin"
  on public.season_prizes
  for select
  to authenticated
  using (public.is_admin());
