-- Season prizes: enums + table (Phase 7)

do $$ begin
  create type public.delivery_carrier as enum ('nova_poshta', 'ukr_poshta', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.prize_shipping_status as enum (
    'pending', 'awaiting_delivery', 'shipped', 'delivered'
  );
exception when duplicate_object then null; end $$;

create table public.season_prizes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  place int not null check (place in (1, 2, 3)),
  trophy_title text not null,
  delivery_first_name text,
  delivery_last_name text,
  delivery_phone text,
  delivery_carrier public.delivery_carrier,
  delivery_address text,
  delivery_city text,
  delivery_branch_number text,
  delivery_submitted_at timestamptz,
  shipping_status public.prize_shipping_status not null default 'pending',
  shipping_tracking_number text,
  secret_prize_description text,
  created_at timestamptz not null default now(),
  unique (season_id, place),
  unique (season_id, user_id)
);

create index season_prizes_user_idx on public.season_prizes (user_id);
create index season_prizes_season_idx on public.season_prizes (season_id);

grant select on public.season_prizes to authenticated;
