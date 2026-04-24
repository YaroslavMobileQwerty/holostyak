create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(current_setting('app.allow_balance_sync', true), '') = 'on' then
    return new;
  end if;
  if not public.is_admin() then
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

create or replace function public.apply_profile_balance_from_ledger() returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  s int;
begin
  select coalesce(sum(ct.delta), 0) into s
  from public.coin_transactions ct
  where ct.user_id = new.user_id;

  perform set_config('app.allow_balance_sync', 'on', true);
  update public.profiles
  set balance = s
  where id = new.user_id;
  perform set_config('app.allow_balance_sync', 'off', true);
  return new;
end;
$$;

drop trigger if exists trg_sync_balance_after_coin_tx on public.coin_transactions;
create trigger trg_sync_balance_after_coin_tx
  after insert on public.coin_transactions
  for each row execute function public.apply_profile_balance_from_ledger();
