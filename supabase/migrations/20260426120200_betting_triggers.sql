create or replace function public.touch_episode_status_changed_at() returns trigger
language plpgsql
as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_episode_status_changed on public.episodes;
create trigger trg_episode_status_changed
  before update on public.episodes
  for each row execute function public.touch_episode_status_changed_at();

create or replace function public.prevent_bet_option_change_if_staked() returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from public.bets b where b.event_id = old.event_id
  ) then
    if new.odds is distinct from old.odds
       or new.custom_label is distinct from old.custom_label
       or new.participant_id is distinct from old.participant_id then
      raise exception 'Cannot change option fields after bets exist on this event';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_bet_options_no_change_if_staked on public.bet_options;
create trigger trg_bet_options_no_change_if_staked
  before update on public.bet_options
  for each row execute function public.prevent_bet_option_change_if_staked();
