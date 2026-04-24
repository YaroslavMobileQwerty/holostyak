-- Banned users cannot place bets or submit purchase requests; non-admins cannot flip is_banned.
alter table public.profiles
  add column if not exists is_banned boolean not null default false;

create index if not exists profiles_is_banned_idx on public.profiles (is_banned) where is_banned = true;

create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then
    if new.is_banned is distinct from old.is_banned then
      raise exception 'Cannot change ban status';
    end if;
    if new.role is distinct from old.role then
      raise exception 'Cannot change role';
    end if;
    if new.balance is distinct from old.balance then
      raise exception 'Cannot change balance directly';
    end if;
    if new.total_won is distinct from old.total_won
       or new.total_bets is distinct from old.total_bets
       or new.correct_bets is distinct from old.correct_bets
       or new.streak_current is distinct from old.streak_current
       or new.streak_best is distinct from old.streak_best then
      raise exception 'Cannot change stats directly';
    end if;
  end if;
  return new;
end;
$$;

-- place_bet: block banned (latest body from 20260428120600)
create or replace function public.place_bet(
  p_event_id uuid,
  p_option_id uuid,
  p_amount int
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_event public.bet_events%rowtype;
  v_ep public.episodes%rowtype;
  v_option public.bet_options%rowtype;
  v_balance int;
  v_new_bal int;
  v_odds numeric(6, 2);
  v_payout int;
  v_bet_id uuid;
  v_max int;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if exists (select 1 from public.profiles p where p.id = v_uid and p.is_banned) then
    raise exception 'user_banned';
  end if;
  if p_amount is null or p_amount < 1 then
    raise exception 'Invalid amount';
  end if;

  select e.*
  into v_event
  from public.bet_events e
  where e.id = p_event_id
  for update;

  if not found then
    raise exception 'Event not found';
  end if;

  select * into v_ep from public.episodes where id = v_event.episode_id;
  if v_ep.status not in ('open', 'live') then
    raise exception 'Episode is not open for betting';
  end if;

  if v_event.status <> 'open' then
    raise exception 'Betting is not open for this event';
  end if;
  if now() < v_event.opens_at then
    raise exception 'Betting has not started';
  end if;
  if now() >= v_event.closes_at then
    raise exception 'Betting is closed';
  end if;

  select * into v_option
  from public.bet_options
  where id = p_option_id and event_id = p_event_id;
  if not found then
    raise exception 'Option not found for this event';
  end if;

  if exists (
    select 1 from public.bets b
    where b.user_id = v_uid and b.event_id = p_event_id
  ) then
    raise exception 'Already placed a bet on this event';
  end if;

  v_balance := coalesce((
    select sum(ct.delta) from public.coin_transactions ct
    where ct.user_id = v_uid
  ), 0);
  if v_balance < p_amount then
    raise exception 'Insufficient balance';
  end if;

  v_max := v_event.max_bet_amount;
  if v_max is not null and p_amount > v_max then
    raise exception 'Amount exceeds max bet for this event';
  end if;

  v_odds := v_option.odds;
  v_payout := floor(p_amount * v_odds)::int;
  v_new_bal := v_balance - p_amount;

  insert into public.bets (
    user_id, event_id, option_id, amount, odds_snapshot, potential_payout, status, payout
  ) values (
    v_uid, p_event_id, p_option_id, p_amount, v_odds, v_payout, 'pending', 0
  ) returning id into v_bet_id;

  insert into public.coin_transactions (
    user_id, delta, balance_after, kind, ref_id
  ) values (
    v_uid, -p_amount, v_new_bal, 'bet_placed', v_bet_id
  );

  update public.bet_events
  set
    total_staked = total_staked + p_amount,
    total_bets = total_bets + 1
  where id = p_event_id;

  update public.bet_options
  set
    option_total_staked = option_total_staked + p_amount,
    option_bets_count = option_bets_count + 1
  where id = p_option_id;

  perform public.evaluate_user_achievements(v_uid);

  return v_bet_id;
end;
$$;

-- submit_purchase_request: block banned
create or replace function public.submit_purchase_request(
  requested_amount int,
  screenshot_path text,
  user_comment text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid;
  v_id uuid;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if exists (select 1 from public.profiles p where p.id = v_uid and p.is_banned) then
    raise exception 'user_banned';
  end if;
  if requested_amount <= 0 then
    raise exception 'Invalid amount';
  end if;
  if screenshot_path is null
     or position(v_uid::text || '/' in screenshot_path) <> 1 then
    raise exception 'Invalid screenshot path';
  end if;

  insert into public.coin_purchase_requests (
    user_id, requested_amount, screenshot_url, user_comment
  ) values (
    v_uid, requested_amount, screenshot_path, user_comment
  )
  returning id into v_id;

  return v_id;
end;
$$;
