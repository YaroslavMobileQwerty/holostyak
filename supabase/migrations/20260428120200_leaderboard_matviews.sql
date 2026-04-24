-- Materialized leaderboards; UNIQUE(user_id) required for REFRESH CONCURRENTLY
drop materialized view if exists public.leaderboard_week;
drop materialized view if exists public.leaderboard_season;
drop materialized view if exists public.leaderboard_all_time;

create materialized view public.leaderboard_all_time as
select
  p.id as user_id,
  p.nickname,
  p.avatar_url,
  p.total_won,
  p.total_bets,
  p.correct_bets,
  case when p.total_bets > 0 then p.correct_bets::double precision / p.total_bets else 0 end as accuracy,
  p.streak_best,
  rank() over (order by p.total_won desc nulls last) as rank_by_won,
  (select count(*)::bigint from public.user_achievements ua where ua.user_id = p.id) as achievement_count
from public.profiles p
where p.total_bets > 0;

create unique index leaderboard_all_time_user_id_uidx on public.leaderboard_all_time (user_id);

create materialized view public.leaderboard_season as
with season_pick as (
  select coalesce(
    (select (value #>> '{}')::uuid from public.app_settings where key = 'active_season_id' limit 1),
    (select s.id from public.seasons s where s.status = 'active' order by s.number desc limit 1)
  ) as sid
),
agg as (
  select
    b.user_id,
    coalesce(sum(case when b.status = 'won' then b.payout else 0 end), 0)::bigint as season_total_won,
    count(*)::bigint as season_bets,
    count(*) filter (where b.status = 'won')::bigint as season_correct
  from public.bets b
  inner join public.bet_events be on be.id = b.event_id
  inner join public.episodes ep on ep.id = be.episode_id
  cross join season_pick sp
  where sp.sid is not null
    and ep.season_id = sp.sid
    and b.status in ('won', 'lost')
  group by b.user_id
)
select
  a.user_id,
  p.nickname,
  p.avatar_url,
  a.season_total_won,
  a.season_bets,
  a.season_correct,
  case when a.season_bets > 0 then a.season_correct::double precision / a.season_bets else 0 end as accuracy,
  p.streak_best,
  rank() over (order by a.season_total_won desc nulls last) as rank_by_won,
  (select count(*)::bigint from public.user_achievements ua where ua.user_id = a.user_id) as achievement_count
from agg a
inner join public.profiles p on p.id = a.user_id;

create unique index leaderboard_season_user_id_uidx on public.leaderboard_season (user_id);

create materialized view public.leaderboard_week as
with wk as (
  select date_trunc('week', now()) as wk_start
),
agg as (
  select
    b.user_id,
    coalesce(sum(case when b.status = 'won' then b.payout else 0 end), 0)::bigint as week_total_won,
    count(*)::bigint as week_bets,
    count(*) filter (where b.status = 'won')::bigint as week_correct
  from public.bets b
  cross join wk
  where coalesce(b.settled_at, b.placed_at) >= wk.wk_start
    and coalesce(b.settled_at, b.placed_at) < wk.wk_start + interval '7 days'
    and b.status in ('won', 'lost')
  group by b.user_id
)
select
  a.user_id,
  p.nickname,
  p.avatar_url,
  a.week_total_won as season_total_won,
  a.week_bets as season_bets,
  a.week_correct as season_correct,
  case when a.week_bets > 0 then a.week_correct::double precision / a.week_bets else 0 end as accuracy,
  p.streak_best,
  rank() over (order by a.week_total_won desc nulls last) as rank_by_won,
  (select count(*)::bigint from public.user_achievements ua where ua.user_id = a.user_id) as achievement_count
from agg a
inner join public.profiles p on p.id = a.user_id;

create unique index leaderboard_week_user_id_uidx on public.leaderboard_week (user_id);

-- Initial populate (non-concurrent)
refresh materialized view public.leaderboard_all_time;
refresh materialized view public.leaderboard_season;
refresh materialized view public.leaderboard_week;

grant select on public.leaderboard_all_time to anon, authenticated;
grant select on public.leaderboard_season to anon, authenticated;
grant select on public.leaderboard_week to anon, authenticated;
