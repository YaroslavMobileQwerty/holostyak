-- profiles (розширення auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text unique,
  avatar_url text,
  role text not null default 'user' check (role in ('user','admin')),
  balance int not null default 0,
  total_won int not null default 0,
  total_bets int not null default 0,
  correct_bets int not null default 0,
  streak_current int not null default 0,
  streak_best int not null default 0,
  created_at timestamptz not null default now()
);
create index profiles_role_idx on public.profiles (role);

-- seasons
create table public.seasons (
  id uuid primary key default gen_random_uuid(),
  number int not null unique,
  title text not null,
  status text not null default 'upcoming' check (status in ('upcoming','active','finished')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

-- bachelors
create table public.bachelors (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  name text not null,
  photo_url text,
  bio text,
  order_index int not null default 1,
  created_at timestamptz not null default now()
);
create index bachelors_season_idx on public.bachelors (season_id);

-- participants
create table public.participants (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  current_bachelor_id uuid references public.bachelors(id) on delete set null,
  name text not null,
  age int,
  city text,
  photo_url text,
  bio text,
  status text not null default 'active' check (status in ('active','eliminated','winner','runner_up')),
  eliminated_episode_id uuid,
  created_at timestamptz not null default now()
);
create index participants_season_idx on public.participants (season_id);
create index participants_current_bachelor_idx on public.participants (current_bachelor_id);
create index participants_status_idx on public.participants (status);

-- episodes
create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  number int not null,
  title text,
  airs_at timestamptz,
  cover_url text,
  status text not null default 'draft' check (status in ('draft','open','locked','live','finalized')),
  status_changed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (season_id, number)
);
create index episodes_season_number_idx on public.episodes (season_id, number);
create index episodes_status_idx on public.episodes (status);

-- FK для participants.eliminated_episode_id (створюємо після таблиці episodes)
alter table public.participants
  add constraint participants_eliminated_episode_fk
  foreign key (eliminated_episode_id) references public.episodes(id) on delete set null;

-- Функція is_admin() для RLS
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;
grant execute on function public.is_admin() to authenticated, anon;
