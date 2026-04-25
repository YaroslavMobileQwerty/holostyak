-- =============================================================================
-- Investor / staging demo: season 14, catalog, 5 test users, bets, leaderboards
-- Source narrative: holostyak-tote/demo/season-14.demo.json
-- Run in Supabase SQL Editor (or psql as postgres / role that bypasses RLS).
-- Requires: pgcrypto (gen_salt / crypt) + auth.instances (cloud/local Supabase).
-- Re-runnable: best on empty project or after `supabase db reset`; if conflicts, trim manually.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- 1) Season 14 + bachelor + participants (photos: picsum, not STB)
-- -----------------------------------------------------------------------------
insert into public.seasons (id, number, title, status, starts_at, ends_at)
values (
  'a0000000-0000-4000-8000-000000000140',
  14,
  'Холостяк 14',
  'active',
  now() - interval '30 days',
  null
)
on conflict (number) do update
set
  title = excluded.title,
  status = 'active',
  starts_at = excluded.starts_at;

-- Finish previous default seed season 15 if present (number 15)
update public.seasons
set status = 'finished', ends_at = coalesce(ends_at, now())
where number = 15
  and id = '00000000-0000-0000-0000-000000000001';

insert into public.bachelors (id, season_id, name, order_index, photo_url, bio)
values (
  'a0000000-0000-4000-8000-000000000141',
  'a0000000-0000-4000-8000-000000000140',
  'Тарас Цимбалюк',
  1,
  'https://upload.wikimedia.org/wikipedia/commons/a/ae/Taras_Tsymbaliuk.jpg',
  'Актор кіно та серіалу; веде демо-історію 14-го сезону (дані з відкритих джерел).'
)
on conflict (id) do update
set
  name = excluded.name,
  photo_url = excluded.photo_url,
  bio = excluded.bio,
  order_index = excluded.order_index,
  season_id = excluded.season_id;

-- Episodes (must exist before participants.eliminated_episode_id references)
insert into public.episodes (id, season_id, number, title, status, airs_at) values
  ('a0000000-0000-4000-8000-000000000201', 'a0000000-0000-4000-8000-000000000140', 1, 'Випуск 1', 'finalized', now() - interval '20 days'),
  ('a0000000-0000-4000-8000-000000000202', 'a0000000-0000-4000-8000-000000000140', 2, 'Випуск 2', 'finalized', now() - interval '14 days'),
  ('a0000000-0000-4000-8000-000000000203', 'a0000000-0000-4000-8000-000000000140', 3, 'Випуск 3', 'open', now() + interval '3 days'),
  ('a0000000-0000-4000-8000-000000000204', 'a0000000-0000-4000-8000-000000000140', 4, 'Випуск 4', 'locked', now() + interval '10 days'),
  ('a0000000-0000-4000-8000-000000000205', 'a0000000-0000-4000-8000-000000000140', 5, 'Випуск 5', 'draft', null),
  ('a0000000-0000-4000-8000-000000000206', 'a0000000-0000-4000-8000-000000000140', 6, 'Випуск 6', 'draft', null)
on conflict (season_id, number) do update
set
  title = excluded.title,
  status = excluded.status,
  airs_at = excluded.airs_at;

-- 12 participants; first two eliminated in ep1 (story)
insert into public.participants (id, season_id, current_bachelor_id, name, age, city, photo_url, bio, status, eliminated_episode_id) values
  ('a0000000-0000-4000-8000-000000000151', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Анастасія Половинкіна', 26, 'Київ', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&h=625&fit=crop&q=80', 'PR, демо', 'eliminated', 'a0000000-0000-4000-8000-000000000201'),
  ('a0000000-0000-4000-8000-000000000152', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Софія Шамія', 25, 'Львів', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=500&h=625&fit=crop&q=80', 'Психологиня', 'eliminated', 'a0000000-0000-4000-8000-000000000201'),
  ('a0000000-0000-4000-8000-000000000153', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Яна Андрієнко', 28, 'Одеса', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=625&fit=crop&q=80', 'Event-менеджер', 'active', null),
  ('a0000000-0000-4000-8000-000000000154', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Діана Зотова', 24, 'Дніпро', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=625&fit=crop&q=80', 'Маркетологиня', 'active', null),
  ('a0000000-0000-4000-8000-000000000155', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Вікторія Крилас', 27, 'Харків', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=625&fit=crop&q=80', 'Декораторка', 'active', null),
  ('a0000000-0000-4000-8000-000000000156', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Оксана Шанюк', 29, 'Вінниця', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=625&fit=crop&q=80', 'Підприємиця', 'active', null),
  ('a0000000-0000-4000-8000-000000000157', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Дар’я Романець', 23, 'Чернівці', 'https://images.unsplash.com/photo-1508214751196-bdf8a7e9e0e0?w=500&h=625&fit=crop&q=80', 'Студентка', 'active', null),
  ('a0000000-0000-4000-8000-000000000158', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Валерія Жуковська', 30, 'Київ', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=625&fit=crop&q=80', 'Юристка', 'active', null),
  ('a0000000-0000-4000-8000-000000000159', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Надія Авраменко', 26, 'Полтава', 'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=500&h=625&fit=crop&q=80', 'IT-рекрутерка', 'active', null),
  ('a0000000-0000-4000-8000-000000000160', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Ірина Кулешина', 27, 'Запоріжжя', 'https://images.unsplash.com/photo-1517209254367-0e7f0345e8e4?w=500&h=625&fit=crop&q=80', 'Флористка', 'active', null),
  ('a0000000-0000-4000-8000-000000000161', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Ольга Дзундза', 32, 'Тернопіль', 'https://images.unsplash.com/photo-1525134479668-1bee5c7c6845?w=500&h=625&fit=crop&q=80', 'Кухарка', 'active', null),
  ('a0000000-0000-4000-8000-000000000162', 'a0000000-0000-4000-8000-000000000140', 'a0000000-0000-4000-8000-000000000141', 'Марина Дурицька', 28, 'Рівне', 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&h=625&fit=crop&q=80', 'Дизайнерка', 'active', null)
on conflict (id) do update
set
  name = excluded.name,
  age = excluded.age,
  city = excluded.city,
  photo_url = excluded.photo_url,
  bio = excluded.bio,
  status = excluded.status,
  eliminated_episode_id = excluded.eliminated_episode_id,
  current_bachelor_id = excluded.current_bachelor_id,
  season_id = excluded.season_id;

-- Active season for app
insert into public.app_settings (key, value) values ('active_season_id', '"a0000000-0000-4000-8000-000000000140"'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- -----------------------------------------------------------------------------
-- 2) Demo users (auth + profiles via trigger) — email/password for staging only
-- -----------------------------------------------------------------------------
do $auth$
declare
  inst_id uuid;
begin
  select id into inst_id from auth.instances limit 1;
  if inst_id is null then
    raise exception 'auth.instances is empty. Run this script on Supabase (local or cloud).';
  end if;
  -- Password for all: InvestorDemo2026!  (change or delete after demo)
  insert into auth.users (id, instance_id, aud, email, role, email_confirmed_at, encrypted_password, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values
    ('b1111111-1111-4111-8111-111111111101', inst_id, 'authenticated', 'demo-admin@holostyak-investor.local', 'authenticated', now(), extensions.crypt('InvestorDemo2026!', gen_salt('bf')), '{}', jsonb_build_object('full_name', 'Адмін демо'), now(), now()),
    ('b1111111-1111-4111-8111-111111111102', inst_id, 'authenticated', 'demo-anna@holostyak-investor.local', 'authenticated', now(), extensions.crypt('InvestorDemo2026!', gen_salt('bf')), '{}', jsonb_build_object('full_name', 'Анна демо'), now(), now()),
    ('b1111111-1111-4111-8111-111111111103', inst_id, 'authenticated', 'demo-oleh@holostyak-investor.local', 'authenticated', now(), extensions.crypt('InvestorDemo2026!', gen_salt('bf')), '{}', jsonb_build_object('full_name', 'Олег демо'), now(), now()),
    ('b1111111-1111-4111-8111-111111111104', inst_id, 'authenticated', 'demo-ira@holostyak-investor.local', 'authenticated', now(), extensions.crypt('InvestorDemo2026!', gen_salt('bf')), '{}', jsonb_build_object('full_name', 'Іра демо'), now(), now()),
    ('b1111111-1111-4111-8111-111111111105', inst_id, 'authenticated', 'demo-katya@holostyak-investor.local', 'authenticated', now(), extensions.crypt('InvestorDemo2026!', gen_salt('bf')), '{}', jsonb_build_object('full_name', 'Катя демо'), now(), now())
  on conflict (id) do nothing;
end
$auth$;

-- email identities (якщо ваша роль/версія Auth дозволяє insert; інакне див. docs/investor-demo.md)
do $ident$
begin
  insert into auth.identities (id, user_id, provider, provider_id, identity_data, last_sign_in_at, created_at, updated_at)
  select
    gen_random_uuid(),
    u.id,
    'email',
    u.id::text,
    jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
    now(), now(), now()
  from auth.users u
  where u.id in (
    'b1111111-1111-4111-8111-111111111101', 'b1111111-1111-4111-8111-111111111102', 'b1111111-1111-4111-8111-111111111103', 'b1111111-1111-4111-8111-111111111104', 'b1111111-1111-4111-8111-111111111105'
  )
  and not exists (select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email');
exception
  when others then
    raise notice 'auth.identities seed skipped: %', sqlerrm;
end
$ident$;

-- -----------------------------------------------------------------------------
-- 3) Bet events + options (ep1 resolved, ep2 resolved, ep3 open)
-- -----------------------------------------------------------------------------
insert into public.bet_events (id, episode_id, type, bachelor_id, title, description, opens_at, closes_at, status, is_live, is_multi_choice, winning_option_ids, max_bet_amount, total_staked, total_bets) values
  (
    'c0000000-0000-4000-8000-000000000301',
    'a0000000-0000-4000-8000-000000000201',
    'first_rose',
    'a0000000-0000-4000-8000-000000000141',
    'Перша троянда: хто отримає квітку від Тараса?',
    'Демо-ставка за випуск 1.',
    now() - interval '25 days',
    now() - interval '20 days',
    'resolved',
    false,
    false,
    array['a0000000-0000-4000-8000-000000000313'::uuid],
    500,
    650,
    5
  ),
  (
    'c0000000-0000-4000-8000-000000000302',
    'a0000000-0000-4000-8000-000000000202',
    'eliminated',
    'a0000000-0000-4000-8000-000000000141',
    'Хто покине проєкт у 2 випуску?',
    'Демо-елімінація.',
    now() - interval '18 days',
    now() - interval '15 days',
    'resolved',
    false,
    false,
    array['a0000000-0000-4000-8000-000000000322'::uuid],
    500,
    300,
    2
  ),
  (
    'c0000000-0000-4000-8000-000000000303',
    'a0000000-0000-4000-8000-000000000203',
    'custom',
    'a0000000-0000-4000-8000-000000000141',
    'Хто отримає додаткове побачення в 3 випуску?',
    'Відкрита ставка для демо UI.',
    now() - interval '2 days',
    now() + interval '2 days',
    'open',
    false,
    false,
    '{}',
    300,
    0,
    0
  )
on conflict (id) do update set
  title = excluded.title,
  status = excluded.status,
  winning_option_ids = excluded.winning_option_ids,
  total_staked = excluded.total_staked,
  total_bets = excluded.total_bets,
  opens_at = excluded.opens_at,
  closes_at = excluded.closes_at;

insert into public.bet_options (id, event_id, participant_id, custom_label, odds, order_index, is_winning) values
  ('a0000000-0000-4000-8000-000000000311', 'c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000151', 'Анастасія', 2.2, 1, false),
  ('a0000000-0000-4000-8000-000000000312', 'c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000152', 'Софія', 2.3, 2, false),
  ('a0000000-0000-4000-8000-000000000313', 'c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000153', 'Яна', 2.5, 3, true),
  ('a0000000-0000-4000-8000-000000000314', 'c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000154', 'Діана', 2.0, 4, false),
  ('a0000000-0000-4000-8000-000000000321', 'c0000000-0000-4000-8000-000000000302', 'a0000000-0000-4000-8000-000000000153', 'Яна', 1.8, 1, false),
  ('a0000000-0000-4000-8000-000000000322', 'c0000000-0000-4000-8000-000000000302', 'a0000000-0000-4000-8000-000000000155', 'Вікторія', 2.1, 2, true),
  ('a0000000-0000-4000-8000-000000000323', 'c0000000-0000-4000-8000-000000000302', 'a0000000-0000-4000-8000-000000000156', 'Оксана', 1.7, 3, false),
  ('a0000000-0000-4000-8000-000000000331', 'c0000000-0000-4000-8000-000000000303', 'a0000000-0000-4000-8000-000000000157', 'Дар’я', 1.5, 1, false),
  ('a0000000-0000-4000-8000-000000000332', 'c0000000-0000-4000-8000-000000000303', 'a0000000-0000-4000-8000-000000000158', 'Валерія', 1.5, 2, false)
on conflict (id) do update set
  odds = excluded.odds,
  custom_label = excluded.custom_label,
  is_winning = excluded.is_winning;

-- -----------------------------------------------------------------------------
-- 4) Grants + placed + resolved bets + ledger (postgres bypasses RLS)
--    Clear previous demo tx for idempotent re-run
-- -----------------------------------------------------------------------------
delete from public.coin_transactions
where user_id in (
  'b1111111-1111-4111-8111-111111111101', 'b1111111-1111-4111-8111-111111111102', 'b1111111-1111-4111-8111-111111111103', 'b1111111-1111-4111-8111-111111111104', 'b1111111-1111-4111-8111-111111111105'
);
delete from public.bets
where id in (
  'd0000000-0000-4000-8000-000000000401', 'd0000000-0000-4000-8000-000000000402', 'd0000000-0000-4000-8000-000000000403', 'd0000000-0000-4000-8000-000000000404', 'd0000000-0000-4000-8000-000000000405', 'd0000000-0000-4000-8000-000000000406', 'd0000000-0000-4000-8000-000000000407'
);

-- Initial grants (2000) — balance via trigger
insert into public.coin_transactions (user_id, delta, balance_after, kind, ref_id, admin_id, note) values
  ('b1111111-1111-4111-8111-111111111101', 2000, 2000, 'admin_grant', null, null, 'investor demo seed'),
  ('b1111111-1111-4111-8111-111111111102', 2000, 2000, 'admin_grant', null, null, 'investor demo seed'),
  ('b1111111-1111-4111-8111-111111111103', 2000, 2000, 'admin_grant', null, null, 'investor demo seed'),
  ('b1111111-1111-4111-8111-111111111104', 2000, 2000, 'admin_grant', null, null, 'investor demo seed'),
  ('b1111111-1111-4111-8111-111111111105', 2000, 2000, 'admin_grant', null, null, 'investor demo seed');

-- Event 1 bets: U1 100@311 loss, U2 200@313 win, U3 150@311 loss, U4 120@313 win, U5 80@312 loss
insert into public.bets (id, user_id, event_id, option_id, amount, odds_snapshot, potential_payout, status, payout, placed_at, settled_at) values
  ('d0000000-0000-4000-8000-000000000401', 'b1111111-1111-4111-8111-111111111101', 'c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000311', 100, 2.2, 220, 'lost', 0, now() - interval '24 days', now() - interval '20 days'),
  ('d0000000-0000-4000-8000-000000000402', 'b1111111-1111-4111-8111-111111111102', 'c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000313', 200, 2.5, 500, 'won', 500, now() - interval '24 days', now() - interval '20 days'),
  ('d0000000-0000-4000-8000-000000000403', 'b1111111-1111-4111-8111-111111111103', 'c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000311', 150, 2.2, 330, 'lost', 0, now() - interval '24 days', now() - interval '20 days'),
  ('d0000000-0000-4000-8000-000000000404', 'b1111111-1111-4111-8111-111111111104', 'c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000313', 120, 2.5, 300, 'won', 300, now() - interval '24 days', now() - interval '20 days'),
  ('d0000000-0000-4000-8000-000000000405', 'b1111111-1111-4111-8111-111111111105', 'c0000000-0000-4000-8000-000000000301', 'a0000000-0000-4000-8000-000000000312', 80, 2.3, 184, 'lost', 0, now() - interval '24 days', now() - interval '20 days');

-- bet_placed + bet_won ledger rows (match bet ids)
insert into public.coin_transactions (user_id, delta, balance_after, kind, ref_id) values
  ('b1111111-1111-4111-8111-111111111101', -100, 1900, 'bet_placed', 'd0000000-0000-4000-8000-000000000401'),
  ('b1111111-1111-4111-8111-111111111102', -200, 1800, 'bet_placed', 'd0000000-0000-4000-8000-000000000402'),
  ('b1111111-1111-4111-8111-111111111103', -150, 1850, 'bet_placed', 'd0000000-0000-4000-8000-000000000403'),
  ('b1111111-1111-4111-8111-111111111104', -120, 1880, 'bet_placed', 'd0000000-0000-4000-8000-000000000404'),
  ('b1111111-1111-4111-8111-111111111105', -80, 1920, 'bet_placed', 'd0000000-0000-4000-8000-000000000405'),
  ('b1111111-1111-4111-8111-111111111102', 500, 2300, 'bet_won', 'd0000000-0000-4000-8000-000000000402'),
  ('b1111111-1111-4111-8111-111111111104', 300, 2180, 'bet_won', 'd0000000-0000-4000-8000-000000000404');

-- Event 2: U1 200@322 win, U3 100@321 loss
insert into public.bets (id, user_id, event_id, option_id, amount, odds_snapshot, potential_payout, status, payout, placed_at, settled_at) values
  ('d0000000-0000-4000-8000-000000000406', 'b1111111-1111-4111-8111-111111111101', 'c0000000-0000-4000-8000-000000000302', 'a0000000-0000-4000-8000-000000000322', 200, 2.1, 420, 'won', 420, now() - interval '16 days', now() - interval '15 days'),
  ('d0000000-0000-4000-8000-000000000407', 'b1111111-1111-4111-8111-111111111103', 'c0000000-0000-4000-8000-000000000302', 'a0000000-0000-4000-8000-000000000321', 100, 1.8, 180, 'lost', 0, now() - interval '16 days', now() - interval '15 days');

insert into public.coin_transactions (user_id, delta, balance_after, kind, ref_id) values
  ('b1111111-1111-4111-8111-111111111101', -200, 2100, 'bet_placed', 'd0000000-0000-4000-8000-000000000406'),
  ('b1111111-1111-4111-8111-111111111103', -100, 1750, 'bet_placed', 'd0000000-0000-4000-8000-000000000407'),
  ('b1111111-1111-4111-8111-111111111101', 420, 2520, 'bet_won', 'd0000000-0000-4000-8000-000000000406');

-- Sync option/event aggregates (as resolve would)
update public.bet_options
set
  option_total_staked = v.staked,
  option_bets_count = v.cnt
from (values
  ('a0000000-0000-4000-8000-000000000311', 100, 1),
  ('a0000000-0000-4000-8000-000000000312', 80, 1),
  ('a0000000-0000-4000-8000-000000000313', 320, 2),
  ('a0000000-0000-4000-8000-000000000314', 0, 0)
) as v (opt, staked, cnt)
where id = v.opt;

update public.bet_options
set
  option_total_staked = v.staked,
  option_bets_count = v.cnt
from (values
  ('a0000000-0000-4000-8000-000000000321', 100, 1),
  ('a0000000-0000-4000-8000-000000000322', 200, 1),
  ('a0000000-0000-4000-8000-000000000323', 0, 0)
) as v (opt, staked, cnt)
where id = v.opt;

-- -----------------------------------------------------------------------------
-- 5) Profile stats, roles, balance (bypass trigger — not run as app user)
-- -----------------------------------------------------------------------------
alter table public.profiles disable trigger profiles_guard;

update public.profiles
set
  total_bets = 2, correct_bets = 1, total_won = 420, streak_current = 1, streak_best = 1, nickname = 'admin_demo', avatar_url = 'https://picsum.photos/seed/du1/120/120', role = 'admin'
where id = 'b1111111-1111-4111-8111-111111111101';

update public.profiles
set
  total_bets = 1, correct_bets = 1, total_won = 500, streak_current = 1, streak_best = 1, nickname = 'anna_demo', avatar_url = 'https://picsum.photos/seed/du2/120/120', role = 'user'
where id = 'b1111111-1111-4111-8111-111111111102';

update public.profiles
set
  total_bets = 2, correct_bets = 0, total_won = 0, streak_current = 0, streak_best = 0, nickname = 'oleh_demo', avatar_url = 'https://picsum.photos/seed/du3/120/120', role = 'user'
where id = 'b1111111-1111-4111-8111-111111111103';

update public.profiles
set
  total_bets = 1, correct_bets = 1, total_won = 300, streak_current = 1, streak_best = 1, nickname = 'ira_demo', avatar_url = 'https://picsum.photos/seed/du4/120/120', role = 'user'
where id = 'b1111111-1111-4111-8111-111111111104';

update public.profiles
set
  total_bets = 1, correct_bets = 0, total_won = 0, streak_current = 0, streak_best = 0, nickname = 'katya_demo', avatar_url = 'https://picsum.photos/seed/du5/120/120', role = 'user'
where id = 'b1111111-1111-4111-8111-111111111105';

update public.profiles p
set balance = s.b
from (
  select user_id, coalesce(sum(delta), 0)::int as b
  from public.coin_transactions
  where user_id in (
    'b1111111-1111-4111-8111-111111111101', 'b1111111-1111-4111-8111-111111111102', 'b1111111-1111-4111-8111-111111111103', 'b1111111-1111-4111-8111-111111111104', 'b1111111-1111-4111-8111-111111111105'
  )
  group by user_id
) s
where p.id = s.user_id;

alter table public.profiles enable trigger profiles_guard;

-- -----------------------------------------------------------------------------
-- 6) Materialized views
-- -----------------------------------------------------------------------------
select public.refresh_leaderboards();
