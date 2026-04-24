alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.bachelors enable row level security;
alter table public.participants enable row level security;
alter table public.episodes enable row level security;

-- profiles: публічне читання (для нікнеймів у лідерборді)
create policy "profiles: public read" on public.profiles
  for select using (true);

create policy "profiles: update own whitelisted fields" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

-- Тригер що блокує зміну захищених полів не-адміном
create or replace function public.guard_profile_update() returns trigger
language plpgsql security definer set search_path = public as $$
begin
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

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- seasons: публічне читання, запис адмін
create policy "seasons: public read" on public.seasons for select using (true);
create policy "seasons: admin write" on public.seasons for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- bachelors: публічне читання, запис адмін
create policy "bachelors: public read" on public.bachelors for select using (true);
create policy "bachelors: admin write" on public.bachelors for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- participants: публічне читання, запис адмін
create policy "participants: public read" on public.participants for select using (true);
create policy "participants: admin write" on public.participants for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- episodes: публічне читання, запис адмін
create policy "episodes: public read" on public.episodes for select using (true);
create policy "episodes: admin write" on public.episodes for all
  to authenticated
  using (public.is_admin()) with check (public.is_admin());
