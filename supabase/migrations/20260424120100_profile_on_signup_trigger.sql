create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  base_nick text;
  final_nick text;
  n int := 0;
begin
  base_nick := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    split_part(new.email, '@', 1)
  );
  final_nick := base_nick;

  while exists (select 1 from public.profiles where nickname = final_nick) loop
    n := n + 1;
    final_nick := base_nick || n::text;
  end loop;

  insert into public.profiles (id, nickname, avatar_url)
  values (
    new.id,
    final_nick,
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
