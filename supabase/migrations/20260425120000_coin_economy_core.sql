-- coin_purchase_requests: screenshot_url = path in storage bucket, e.g. :user_id/xxx.jpg
create table public.coin_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  requested_amount int not null check (requested_amount > 0),
  screenshot_url text not null,
  user_comment text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  approved_amount int,
  admin_comment text,
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);
create index coin_purchase_requests_user_id_idx on public.coin_purchase_requests (user_id);
create index coin_purchase_requests_status_created_idx on public.coin_purchase_requests (status, created_at desc);

create table public.coin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  delta int not null,
  balance_after int not null,
  kind text not null check (
    kind in (
      'purchase_approved',
      'bet_placed',
      'bet_won',
      'bet_refund',
      'admin_grant',
      'admin_deduct'
    )
  ),
  ref_id uuid,
  admin_id uuid references public.profiles (id),
  note text,
  created_at timestamptz not null default now()
);
create index coin_transactions_user_id_created_idx on public.coin_transactions (user_id, created_at desc);
create index coin_transactions_kind_idx on public.coin_transactions (kind);

create unique index coin_transactions_one_purchase_approved_per_ref
  on public.coin_transactions (ref_id)
  where kind = 'purchase_approved' and ref_id is not null;

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles (id) on delete restrict,
  action text not null,
  target_type text not null,
  target_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index admin_audit_log_admin_created_idx on public.admin_audit_log (admin_id, created_at desc);

create table public.app_settings (
  key text primary key,
  value jsonb not null,
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index notifications_user_id_created_idx on public.notifications (user_id, created_at desc);
