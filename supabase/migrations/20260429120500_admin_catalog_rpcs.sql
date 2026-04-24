-- Season / bachelor / participant mutations via single audit trail (Phase 6)

create or replace function public.admin_create_season(
  p_number int,
  p_title text,
  p_status text,
  p_starts_at timestamptz,
  p_ends_at timestamptz
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_st text := coalesce(nullif(trim(p_status), ''), 'upcoming');
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_number is null or p_number < 1 then raise exception 'Invalid season number'; end if;
  if p_title is null or length(trim(p_title)) < 1 then raise exception 'Title required'; end if;
  if v_st not in ('upcoming', 'active', 'finished') then raise exception 'Invalid status'; end if;

  if v_st = 'active' then
    update public.seasons set status = 'finished' where status = 'active';
  end if;

  insert into public.seasons (number, title, status, starts_at, ends_at)
  values (p_number, trim(p_title), v_st, p_starts_at, p_ends_at)
  returning id into v_id;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(), 'season_created', 'season', v_id,
    jsonb_build_object('number', p_number, 'title', trim(p_title), 'status', v_st)
  );
  return v_id;
end;
$$;

create or replace function public.admin_update_season(
  p_id uuid,
  p_number int,
  p_title text,
  p_starts_at timestamptz,
  p_ends_at timestamptz
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_id is null then raise exception 'id required'; end if;
  if p_number is null or p_number < 1 then raise exception 'Invalid season number'; end if;
  if p_title is null or length(trim(p_title)) < 1 then raise exception 'Title required'; end if;

  update public.seasons
  set number = p_number, title = trim(p_title), starts_at = p_starts_at, ends_at = p_ends_at
  where id = p_id;
  if not found then raise exception 'Season not found'; end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(), 'season_updated', 'season', p_id,
    jsonb_build_object('number', p_number, 'title', trim(p_title), 'starts_at', p_starts_at, 'ends_at', p_ends_at)
  );
end;
$$;

create or replace function public.admin_set_season_status(p_id uuid, p_status text) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_st text := trim(p_status);
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_id is null then raise exception 'id required'; end if;
  if v_st not in ('upcoming', 'active', 'finished') then raise exception 'Invalid status'; end if;

  if v_st = 'active' then
    update public.seasons set status = 'finished' where status = 'active' and id <> p_id;
  end if;

  update public.seasons set status = v_st where id = p_id;
  if not found then raise exception 'Season not found'; end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (auth.uid(), 'season_status', 'season', p_id, jsonb_build_object('status', v_st));
end;
$$;

create or replace function public.admin_create_bachelor(
  p_season_id uuid,
  p_name text,
  p_photo_url text,
  p_bio text,
  p_order_index int
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_oi int := coalesce(p_order_index, 1);
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_season_id is null then raise exception 'season_id required'; end if;
  if p_name is null or length(trim(p_name)) < 1 then raise exception 'Name required'; end if;
  if not exists (select 1 from public.seasons s where s.id = p_season_id) then
    raise exception 'Season not found';
  end if;

  insert into public.bachelors (season_id, name, photo_url, bio, order_index)
  values (p_season_id, trim(p_name), nullif(trim(p_photo_url), ''), nullif(trim(p_bio), ''), v_oi)
  returning id into v_id;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(), 'bachelor_created', 'bachelor', v_id,
    jsonb_build_object('season_id', p_season_id, 'name', trim(p_name), 'order_index', v_oi)
  );
  return v_id;
end;
$$;

create or replace function public.admin_update_bachelor(
  p_id uuid,
  p_name text,
  p_photo_url text,
  p_bio text,
  p_order_index int
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_id is null then raise exception 'id required'; end if;
  if p_name is null or length(trim(p_name)) < 1 then raise exception 'Name required'; end if;

  update public.bachelors
  set
    name = trim(p_name),
    photo_url = nullif(trim(p_photo_url), ''),
    bio = nullif(trim(p_bio), ''),
    order_index = coalesce(p_order_index, 1)
  where id = p_id;
  if not found then raise exception 'Bachelor not found'; end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(), 'bachelor_updated', 'bachelor', p_id,
    jsonb_build_object('name', trim(p_name), 'order_index', coalesce(p_order_index, 1))
  );
end;
$$;

create or replace function public.admin_create_participant(
  p_season_id uuid,
  p_name text,
  p_current_bachelor_id uuid,
  p_age int,
  p_city text,
  p_photo_url text,
  p_bio text,
  p_status text,
  p_eliminated_episode_id uuid
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_st text := coalesce(nullif(trim(p_status), ''), 'active');
  v_season_bachelor uuid;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_season_id is null then raise exception 'season_id required'; end if;
  if p_name is null or length(trim(p_name)) < 1 then raise exception 'Name required'; end if;
  if v_st not in ('active', 'eliminated', 'winner', 'runner_up') then raise exception 'Invalid status'; end if;

  if p_current_bachelor_id is not null then
    select b.season_id into v_season_bachelor from public.bachelors b where b.id = p_current_bachelor_id;
    if v_season_bachelor is null then
      raise exception 'Bachelor not found';
    end if;
    if v_season_bachelor <> p_season_id then
      raise exception 'Bachelor belongs to a different season';
    end if;
  end if;

  if p_eliminated_episode_id is not null then
    if not exists (select 1 from public.episodes e where e.id = p_eliminated_episode_id and e.season_id = p_season_id) then
      raise exception 'Invalid eliminated episode for this season';
    end if;
  end if;

  insert into public.participants (
    season_id, current_bachelor_id, name, age, city, photo_url, bio, status, eliminated_episode_id
  ) values (
    p_season_id,
    p_current_bachelor_id,
    trim(p_name),
    p_age,
    nullif(trim(p_city), ''),
    nullif(trim(p_photo_url), ''),
    nullif(trim(p_bio), ''),
    v_st,
    p_eliminated_episode_id
  ) returning id into v_id;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(), 'participant_created', 'participant', v_id,
    jsonb_build_object('season_id', p_season_id, 'name', trim(p_name), 'status', v_st)
  );
  return v_id;
end;
$$;

create or replace function public.admin_update_participant(
  p_id uuid,
  p_name text,
  p_current_bachelor_id uuid,
  p_age int,
  p_city text,
  p_photo_url text,
  p_bio text,
  p_status text,
  p_eliminated_episode_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_st text;
  v_season uuid;
  v_season_bachelor uuid;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_id is null then raise exception 'id required'; end if;
  if p_name is null or length(trim(p_name)) < 1 then raise exception 'Name required'; end if;

  select season_id into v_season from public.participants where id = p_id;
  if v_season is null then raise exception 'Participant not found'; end if;

  v_st := coalesce(nullif(trim(p_status), ''), 'active');
  if v_st not in ('active', 'eliminated', 'winner', 'runner_up') then raise exception 'Invalid status'; end if;

  if p_current_bachelor_id is not null then
    select b.season_id into v_season_bachelor from public.bachelors b where b.id = p_current_bachelor_id;
    if v_season_bachelor is null then
      raise exception 'Bachelor not found';
    end if;
    if v_season_bachelor <> v_season then
      raise exception 'Bachelor belongs to a different season';
    end if;
  end if;

  if p_eliminated_episode_id is not null then
    if not exists (select 1 from public.episodes e where e.id = p_eliminated_episode_id and e.season_id = v_season) then
      raise exception 'Invalid eliminated episode for this season';
    end if;
  end if;

  update public.participants
  set
    name = trim(p_name),
    current_bachelor_id = p_current_bachelor_id,
    age = p_age,
    city = nullif(trim(p_city), ''),
    photo_url = nullif(trim(p_photo_url), ''),
    bio = nullif(trim(p_bio), ''),
    status = v_st,
    eliminated_episode_id = p_eliminated_episode_id
  where id = p_id;
  if not found then raise exception 'Participant not found'; end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(), 'participant_updated', 'participant', p_id,
    jsonb_build_object('name', trim(p_name), 'status', v_st)
  );
end;
$$;

grant execute on function public.admin_create_season(int, text, text, timestamptz, timestamptz) to authenticated;
grant execute on function public.admin_update_season(uuid, int, text, timestamptz, timestamptz) to authenticated;
grant execute on function public.admin_set_season_status(uuid, text) to authenticated;
grant execute on function public.admin_create_bachelor(uuid, text, text, text, int) to authenticated;
grant execute on function public.admin_update_bachelor(uuid, text, text, text, int) to authenticated;
grant execute on function public.admin_create_participant(uuid, text, uuid, int, text, text, text, text, uuid) to authenticated;
grant execute on function public.admin_update_participant(uuid, text, uuid, int, text, text, text, text, uuid) to authenticated;
