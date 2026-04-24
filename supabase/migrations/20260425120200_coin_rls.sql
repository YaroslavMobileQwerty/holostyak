alter table public.coin_purchase_requests enable row level security;
alter table public.coin_transactions enable row level security;
alter table public.admin_audit_log enable row level security;
alter table public.app_settings enable row level security;
alter table public.notifications enable row level security;

create policy "coin_purchase_requests_select"
  on public.coin_purchase_requests for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "coin_transactions_select"
  on public.coin_transactions for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "app_settings_select"
  on public.app_settings for select
  using (true);

create policy "app_settings_write_admin"
  on public.app_settings for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "admin_audit_log_select"
  on public.admin_audit_log for select
  to authenticated
  using (public.is_admin());

create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (auth.uid() = user_id);

grant select on public.app_settings to anon;
