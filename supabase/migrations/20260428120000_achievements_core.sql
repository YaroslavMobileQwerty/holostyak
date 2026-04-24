-- Achievements + user_achievements; extend notifications for deep links
create table public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text,
  icon_url text,
  tier text not null check (tier in ('bronze', 'silver', 'gold', 'platinum')),
  category text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);
create index user_achievements_user_idx on public.user_achievements (user_id, unlocked_at desc);

alter table public.notifications
  add column if not exists action_url text,
  add column if not exists metadata jsonb;

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where is_read = false;
