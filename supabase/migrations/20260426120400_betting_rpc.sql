-- place_bet: one bet per user per event; balance from ledger; episode must allow betting
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

  return v_bet_id;
end;
$$;

grant execute on function public.place_bet(uuid, uuid, int) to authenticated;

-- resolve_bet_event: only from closed; pay winners via ledger; update profile stats
create or replace function public.resolve_bet_event(
  p_event_id uuid,
  p_winning_option_ids uuid[]
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.bet_events%rowtype;
  v_bet record;
  v_payout int;
  v_balance int;
  v_new_bal int;
  v_winners int := 0;
  v_paid int := 0;
  v_bad int;
  v_uid uuid;
  v_new_streak int;
  v_new_best int;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if p_winning_option_ids is null or cardinality(p_winning_option_ids) < 1 then
    raise exception 'Winning options required';
  end if;

  select * into v_event from public.bet_events where id = p_event_id for update;
  if not found then
    raise exception 'Event not found';
  end if;
  if v_event.status <> 'closed' then
    raise exception 'Event must be closed before resolution';
  end if;
  if not v_event.is_multi_choice and cardinality(p_winning_option_ids) <> 1 then
    raise exception 'Single winning option required';
  end if;

  select count(*) into v_bad
  from unnest(p_winning_option_ids) u (opt_id)
  where not exists (
    select 1 from public.bet_options o
    where o.id = u.opt_id and o.event_id = p_event_id
  );
  if v_bad > 0 then
    raise exception 'Invalid winning option for this event';
  end if;

  for v_bet in
    select * from public.bets where event_id = p_event_id for update
  loop
    if v_bet.option_id = any (p_winning_option_ids) then
      v_payout := floor(v_bet.amount * v_bet.odds_snapshot)::int;
      v_balance := coalesce((
        select sum(ct.delta) from public.coin_transactions ct
        where ct.user_id = v_bet.user_id
      ), 0);
      v_new_bal := v_balance + v_payout;

      insert into public.coin_transactions (
        user_id, delta, balance_after, kind, ref_id
      ) values (
        v_bet.user_id, v_payout, v_new_bal, 'bet_won', v_bet.id
      );

      update public.bets
      set
        status = 'won',
        payout = v_payout,
        settled_at = now()
      where id = v_bet.id;

      v_winners := v_winners + 1;
      v_paid := v_paid + v_payout;
    else
      update public.bets
      set
        status = 'lost',
        payout = 0,
        settled_at = now()
      where id = v_bet.id;
    end if;
  end loop;

  update public.bet_options
  set is_winning = (id = any (p_winning_option_ids))
  where event_id = p_event_id;

  update public.bet_events
  set
    status = 'resolved',
    winning_option_ids = p_winning_option_ids,
    resolved_by = auth.uid(),
    resolved_at = now()
  where id = p_event_id;

  for v_uid in
    select distinct user_id from public.bets where event_id = p_event_id
  loop
    select * into v_bet from public.bets
    where event_id = p_event_id and user_id = v_uid;
    perform set_config('app.allow_profile_stats_sync', 'on', true);
    if v_bet.status = 'won' then
      select streak_current, streak_best into v_new_streak, v_new_best
      from public.profiles where id = v_uid for update;
      v_new_streak := v_new_streak + 1;
      v_new_best := greatest(v_new_best, v_new_streak);
      update public.profiles
      set
        total_bets = total_bets + 1,
        correct_bets = correct_bets + 1,
        total_won = total_won + v_bet.payout,
        streak_current = v_new_streak,
        streak_best = v_new_best
      where id = v_uid;
    else
      update public.profiles
      set
        total_bets = total_bets + 1,
        streak_current = 0
      where id = v_uid;
    end if;
    perform set_config('app.allow_profile_stats_sync', 'off', true);
  end loop;

  for v_bet in
    select b.* from public.bets b
    where b.event_id = p_event_id and b.status = 'won'
  loop
    insert into public.notifications (user_id, type, title, body)
    values (
      v_bet.user_id,
      'bet_won',
      'Ви виграли ставку',
      format('Виплачено %s балів за подію «%s».', v_bet.payout, v_event.title)
    );
  end loop;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(),
    'bet_event_resolved',
    'bet_event',
    p_event_id,
    jsonb_build_object(
      'winning_option_ids', p_winning_option_ids,
      'winners_count', v_winners,
      'total_paid', v_paid
    )
  );

  return jsonb_build_object(
    'winners_count', v_winners,
    'total_paid', v_paid
  );
end;
$$;

grant execute on function public.resolve_bet_event(uuid, uuid[]) to authenticated;

create or replace function public.void_bet_event(
  p_event_id uuid,
  p_reason text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.bet_events%rowtype;
  v_bet record;
  v_balance int;
  v_new_bal int;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if p_reason is null or length(trim(p_reason)) = 0 then
    raise exception 'Reason is required';
  end if;

  select * into v_event from public.bet_events where id = p_event_id for update;
  if not found then
    raise exception 'Event not found';
  end if;
  if v_event.status in ('resolved', 'void') then
    raise exception 'Event already settled or voided';
  end if;

  for v_bet in
    select * from public.bets
    where event_id = p_event_id and status = 'pending'
    for update
  loop
    v_balance := coalesce((
      select sum(ct.delta) from public.coin_transactions ct
      where ct.user_id = v_bet.user_id
    ), 0);
    v_new_bal := v_balance + v_bet.amount;

    insert into public.coin_transactions (
      user_id, delta, balance_after, kind, ref_id, note
    ) values (
      v_bet.user_id, v_bet.amount, v_new_bal, 'bet_refund', v_bet.id,
      'void: ' || left(p_reason, 200)
    );

    update public.bets
    set
      status = 'void',
      payout = 0,
      settled_at = now()
    where id = v_bet.id;
  end loop;

  update public.bet_events
  set
    status = 'void',
    resolved_by = auth.uid(),
    resolved_at = now()
  where id = p_event_id;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(),
    'bet_event_voided',
    'bet_event',
    p_event_id,
    jsonb_build_object('reason', p_reason)
  );
end;
$$;

grant execute on function public.void_bet_event(uuid, text) to authenticated;

create or replace function public.lock_bet_event(p_event_id uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n int;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  update public.bet_events
  set status = 'closed'
  where id = p_event_id and status = 'open';
  get diagnostics v_n = row_count;
  if v_n = 0 then
    raise exception 'Event not found or not open';
  end if;
end;
$$;

grant execute on function public.lock_bet_event(uuid) to authenticated;

create or replace function public.delete_bet_option(p_option_id uuid) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n int;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if exists (select 1 from public.bets b where b.option_id = p_option_id) then
    raise exception 'Cannot delete option with existing bets';
  end if;
  delete from public.bet_options where id = p_option_id;
  get diagnostics v_n = row_count;
  if v_n = 0 then
    raise exception 'Option not found';
  end if;
end;
$$;

grant execute on function public.delete_bet_option(uuid) to authenticated;

create or replace function public.auto_lock_expired_events() returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n int;
begin
  update public.bet_events
  set status = 'closed'
  where status = 'open' and closes_at <= now();
  get diagnostics v_n = row_count;
  return v_n;
end;
$$;

grant execute on function public.auto_lock_expired_events() to authenticated;
