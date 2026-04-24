create or replace function public.guard_profile_update() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(current_setting('app.allow_balance_sync', true), '') = 'on' then
    return new;
  end if;
  if coalesce(current_setting('app.allow_profile_stats_sync', true), '') = 'on' then
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
