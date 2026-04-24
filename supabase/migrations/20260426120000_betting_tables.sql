-- bet_events: closes_at = end of betting window
create table public.bet_events (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references public.episodes (id) on delete cascade,
  type text not null check (
    type in (
      'eliminated', 'first_rose', 'tete_a_tete', 'season_winner', 'custom', 'lightning'
    )
  ),
  bachelor_id uuid references public.bachelors (id) on delete set null,
  title text not null,
  description text,
  opens_at timestamptz not null default now(),
  closes_at timestamptz not null,
  status text not null default 'scheduled' check (status in (
    'scheduled', 'open', 'closed', 'resolved', 'void'
  )),
  is_live boolean not null default false,
  is_multi_choice boolean not null default false,
  winning_option_ids uuid[] not null default '{}',
  max_bet_amount int check (max_bet_amount is null or max_bet_amount >= 1),
  total_staked int not null default 0,
  total_bets int not null default 0,
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index bet_events_episode_status_idx on public.bet_events (episode_id, status);
create index bet_events_closes_at_idx on public.bet_events (closes_at desc);

create table public.bet_options (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.bet_events (id) on delete cascade,
  participant_id uuid references public.participants (id) on delete set null,
  custom_label text not null,
  odds numeric(6, 2) not null check (odds >= 1.01 and odds <= 100),
  order_index int not null default 0,
  is_winning boolean not null default false,
  option_total_staked int not null default 0,
  option_bets_count int not null default 0
);
create index bet_options_event_id_idx on public.bet_options (event_id);

create table public.bets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_id uuid not null references public.bet_events (id) on delete cascade,
  option_id uuid not null references public.bet_options (id) on delete restrict,
  amount int not null check (amount > 0),
  odds_snapshot numeric(6, 2) not null,
  potential_payout int not null,
  status text not null default 'pending' check (status in ('pending', 'won', 'lost', 'void')),
  payout int not null default 0,
  placed_at timestamptz not null default now(),
  settled_at timestamptz,
  unique (user_id, event_id)
);
create index bets_user_created_idx on public.bets (user_id, placed_at desc);
create index bets_event_option_idx on public.bets (event_id, option_id);

create unique index coin_transactions_one_bet_placed_per_ref
  on public.coin_transactions (ref_id)
  where kind = 'bet_placed' and ref_id is not null;

create unique index coin_transactions_one_bet_won_per_ref
  on public.coin_transactions (ref_id)
  where kind = 'bet_won' and ref_id is not null;

create unique index coin_transactions_one_bet_refund_per_ref
  on public.coin_transactions (ref_id)
  where kind = 'bet_refund' and ref_id is not null;
