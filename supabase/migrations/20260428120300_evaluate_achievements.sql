-- Internal: insert user_achievement + notification; returns true if newly granted
create or replace function public._award_achievement(
  p_user_id uuid,
  p_code text
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_a public.achievements%rowtype;
  v_n int;
begin
  select * into v_a from public.achievements where id = p_code;
  if not found then
    return false;
  end if;

  insert into public.user_achievements (user_id, achievement_id)
  values (p_user_id, p_code)
  on conflict do nothing;
  get diagnostics v_n = row_count;
  if v_n = 0 then
    return false;
  end if;

  insert into public.notifications (
    user_id, type, title, body, action_url, metadata
  ) values (
    p_user_id,
    'achievement_unlocked',
    v_a.title,
    v_a.description,
    '/achievements',
    jsonb_build_object('achievement_id', p_code)
  );
  return true;
end;
$$;

revoke all on function public._award_achievement(uuid, text) from public;

create or replace function public.evaluate_user_achievements(p_user_id uuid)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_out text[] := array[]::text[];
  v_season_id uuid;
  v_need int;
  v_have int;
  v_cnt int;
  v_sum int;
  v_streak int;
  v_total_bets int;
begin
  if p_user_id is null then
    return v_out;
  end if;

  if exists (select 1 from public.bets b where b.user_id = p_user_id) then
    if public._award_achievement(p_user_id, 'first_bet') then
      v_out := array_append(v_out, 'first_bet');
    end if;
  end if;

  if exists (
    select 1 from public.bets b where b.user_id = p_user_id and b.status = 'won'
  ) then
    if public._award_achievement(p_user_id, 'first_win') then
      v_out := array_append(v_out, 'first_win');
    end if;
  end if;

  if exists (
    select 1 from public.profiles p
    where p.id = p_user_id
      and p.nickname is not null
      and length(trim(p.nickname)) > 0
      and p.avatar_url is not null
      and length(trim(p.avatar_url)) > 0
  ) then
    if public._award_achievement(p_user_id, 'profile_complete') then
      v_out := array_append(v_out, 'profile_complete');
    end if;
  end if;

  if exists (
    select 1 from public.coin_purchase_requests r
    where r.user_id = p_user_id and r.status = 'approved'
  ) then
    if public._award_achievement(p_user_id, 'donor_first') then
      v_out := array_append(v_out, 'donor_first');
    end if;
  end if;

  select count(*)::int into v_total_bets from public.bets b where b.user_id = p_user_id;
  if v_total_bets >= 10 then
    if public._award_achievement(p_user_id, 'total_bets_10') then
      v_out := array_append(v_out, 'total_bets_10');
    end if;
  end if;
  if v_total_bets >= 50 then
    if public._award_achievement(p_user_id, 'total_bets_50') then
      v_out := array_append(v_out, 'total_bets_50');
    end if;
  end if;
  if v_total_bets >= 100 then
    if public._award_achievement(p_user_id, 'total_bets_100') then
      v_out := array_append(v_out, 'total_bets_100');
    end if;
  end if;

  select p.streak_best into v_streak from public.profiles p where p.id = p_user_id;
  if coalesce(v_streak, 0) >= 3 then
    if public._award_achievement(p_user_id, 'streak_3') then
      v_out := array_append(v_out, 'streak_3');
    end if;
  end if;
  if coalesce(v_streak, 0) >= 5 then
    if public._award_achievement(p_user_id, 'streak_5') then
      v_out := array_append(v_out, 'streak_5');
    end if;
  end if;
  if coalesce(v_streak, 0) >= 10 then
    if public._award_achievement(p_user_id, 'streak_10') then
      v_out := array_append(v_out, 'streak_10');
    end if;
  end if;

  if exists (
    select 1 from public.bets b
    where b.user_id = p_user_id and b.status = 'won' and b.odds_snapshot >= 5
  ) then
    if public._award_achievement(p_user_id, 'underdog_winner') then
      v_out := array_append(v_out, 'underdog_winner');
    end if;
  end if;

  if exists (
    select 1 from public.bets b
    where b.user_id = p_user_id and b.status = 'won' and b.amount >= 1000
  ) then
    if public._award_achievement(p_user_id, 'high_roller_1000') then
      v_out := array_append(v_out, 'high_roller_1000');
    end if;
  end if;

  if exists (
    select 1 from public.bets b
    join public.bet_events e on e.id = b.event_id
    where b.user_id = p_user_id and e.type = 'lightning'
  ) then
    if public._award_achievement(p_user_id, 'lightning_first') then
      v_out := array_append(v_out, 'lightning_first');
    end if;
  end if;

  if exists (
    select 1 from public.bets b
    join public.bet_events e on e.id = b.event_id
    where b.user_id = p_user_id and b.status = 'won' and e.type = 'lightning'
  ) then
    if public._award_achievement(p_user_id, 'lightning_won') then
      v_out := array_append(v_out, 'lightning_won');
    end if;
  end if;

  select count(*)::int into v_cnt
  from public.bets b
  join public.bet_events e on e.id = b.event_id
  where b.user_id = p_user_id and e.type = 'lightning';
  if v_cnt >= 10 then
    if public._award_achievement(p_user_id, 'lightning_hunter') then
      v_out := array_append(v_out, 'lightning_hunter');
    end if;
  end if;

  if exists (
    select 1 from public.bets b
    join public.bet_events e on e.id = b.event_id
    where b.user_id = p_user_id and b.status = 'won' and e.type = 'season_winner'
  ) then
    if public._award_achievement(p_user_id, 'season_winner_predicted') then
      v_out := array_append(v_out, 'season_winner_predicted');
    end if;
  end if;

  select coalesce(sum(r.approved_amount), 0) into v_sum
  from public.coin_purchase_requests r
  where r.user_id = p_user_id and r.status = 'approved';
  if v_sum >= 5000 then
    if public._award_achievement(p_user_id, 'donor_5000') then
      v_out := array_append(v_out, 'donor_5000');
    end if;
  end if;
  if v_sum >= 1000 then
    if public._award_achievement(p_user_id, 'donor_1000') then
      v_out := array_append(v_out, 'donor_1000');
    end if;
  end if;

  v_season_id := coalesce(
    (select (value #>> '{}')::uuid from public.app_settings where key = 'active_season_id' limit 1),
    (select s.id from public.seasons s where s.status = 'active' order by s.number desc limit 1)
  );

  if v_season_id is not null then
    select count(*) into v_need
    from public.episodes e
    where e.season_id = v_season_id
      and e.status in ('open', 'locked', 'live', 'finalized');

    select count(distinct e.id) into v_have
    from public.bets b
    join public.bet_events be on be.id = b.event_id
    join public.episodes e on e.id = be.episode_id
    where b.user_id = p_user_id and e.season_id = v_season_id;

    if v_need > 0 and v_have = v_need then
      if public._award_achievement(p_user_id, 'loyal_full_season') then
        v_out := array_append(v_out, 'loyal_full_season');
      end if;
    end if;
  end if;

  if exists (
    select 1
    from public.episodes ep
    where exists (
      select 1 from public.bets b
      join public.bet_events ev on ev.id = b.event_id
      where ev.episode_id = ep.id and b.user_id = p_user_id
    )
    and not exists (
      select 1 from public.bets b
      join public.bet_events ev on ev.id = b.event_id
      where ev.episode_id = ep.id and b.user_id = p_user_id
        and b.status <> 'won'
    )
  ) then
    if public._award_achievement(p_user_id, 'perfect_episode') then
      v_out := array_append(v_out, 'perfect_episode');
    end if;
  end if;

  return v_out;
end;
$$;

revoke all on function public.evaluate_user_achievements(uuid) from public;

create or replace function public.award_season_leaderboard_achievements(p_season_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
begin
  if p_season_id is null then
    return;
  end if;

  for rec in
    with agg as (
      select
        b.user_id,
        coalesce(sum(case when b.status = 'won' then b.payout else 0 end), 0) as season_total_won
      from public.bets b
      inner join public.bet_events be on be.id = b.event_id
      inner join public.episodes ep on ep.id = be.episode_id
      where ep.season_id = p_season_id and b.status in ('won', 'lost')
      group by b.user_id
    ),
    ranked as (
      select user_id, rank() over (order by season_total_won desc nulls last) as rnk
      from agg
    )
    select * from ranked
    order by rnk asc
  loop
    if rec.rnk = 1 then
      perform public._award_achievement(rec.user_id, 'season_top1');
    end if;
    if rec.rnk <= 3 then
      perform public._award_achievement(rec.user_id, 'season_top3');
    end if;
  end loop;
end;
$$;

revoke all on function public.award_season_leaderboard_achievements(uuid) from public;

create or replace function public.tr_profile_evaluate_achievements()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.nickname is distinct from old.nickname
     or new.avatar_url is distinct from old.avatar_url then
    perform public.evaluate_user_achievements(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists profile_achievements_eval on public.profiles;
create trigger profile_achievements_eval
  after update of nickname, avatar_url on public.profiles
  for each row
  execute function public.tr_profile_evaluate_achievements();

create or replace function public.tr_season_finished_award_lb()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'finished' and (old.status is distinct from new.status) then
    perform public.award_season_leaderboard_achievements(new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists season_finished_award on public.seasons;
create trigger season_finished_award
  after update of status on public.seasons
  for each row
  execute function public.tr_season_finished_award_lb();
