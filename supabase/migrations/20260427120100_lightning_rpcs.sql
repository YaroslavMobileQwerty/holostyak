create or replace function public.create_lightning_event(
  p_episode_id uuid,
  p_title text,
  p_description text default null,
  p_bachelor_id uuid default null,
  p_lock_time_seconds int default 120,
  p_options jsonb default '[]'::jsonb,
  p_max_bet_amount int default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ep_status text;
  v_lock int;
  v_closes timestamptz;
  v_event_id uuid;
  v_len int;
  v_i int;
  v_el jsonb;
  v_label text;
  v_odds numeric(6, 2);
  v_pid uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if p_title is null or length(trim(p_title)) < 1 then
    raise exception 'Title required';
  end if;

  v_lock := p_lock_time_seconds;
  if v_lock is null or v_lock < 30 or v_lock > 600 then
    raise exception 'lock_time_seconds must be between 30 and 600';
  end if;

  v_len := coalesce(jsonb_array_length(p_options), 0);
  if v_len < 2 then
    raise exception 'At least two options required';
  end if;

  select status into v_ep_status from public.episodes where id = p_episode_id;
  if not found then
    raise exception 'Episode not found';
  end if;
  if v_ep_status <> 'live' then
    raise exception 'Episode must be live for lightning events';
  end if;

  if p_max_bet_amount is not null and p_max_bet_amount < 1 then
    raise exception 'Invalid max_bet_amount';
  end if;

  v_closes := now() + (v_lock::text || ' seconds')::interval;

  insert into public.bet_events (
    episode_id, type, bachelor_id, title, description,
    opens_at, closes_at, status, is_live, is_multi_choice,
    max_bet_amount
  ) values (
    p_episode_id, 'lightning', p_bachelor_id, p_title, p_description,
    now(), v_closes, 'open', true, false,
    p_max_bet_amount
  ) returning id into v_event_id;

  for v_i in 0..v_len - 1 loop
    v_el := p_options->v_i;
    v_label := trim(coalesce(v_el->>'custom_label', ''));
    if length(v_label) < 1 then
      raise exception 'Each option needs custom_label';
    end if;
    if v_el ? 'odds' and v_el->>'odds' is not null and v_el->>'odds' <> '' then
      v_odds := (v_el->>'odds')::numeric;
    else
      raise exception 'Each option needs odds';
    end if;
    if v_odds < 1.01 or v_odds > 100 then
      raise exception 'Invalid odds';
    end if;
    if v_el->>'participant_id' is not null and v_el->>'participant_id' <> '' then
      v_pid := (v_el->>'participant_id')::uuid;
    else
      v_pid := null;
    end if;

    insert into public.bet_options (
      event_id, participant_id, custom_label, odds, order_index
    ) values (
      v_event_id, v_pid, v_label, v_odds, v_i
    );
  end loop;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    auth.uid(),
    'lightning_created',
    'bet_event',
    v_event_id,
    jsonb_build_object('episode_id', p_episode_id, 'lock_seconds', v_lock)
  );

  return v_event_id;
end;
$$;

grant execute on function public.create_lightning_event(
  uuid, text, text, uuid, int, jsonb, int
) to authenticated;

create or replace function public.quick_resolve_lightning(
  p_event_id uuid,
  p_winning_option_id uuid
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.bet_events%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  select * into v_event from public.bet_events where id = p_event_id for update;
  if not found then
    raise exception 'Event not found';
  end if;
  if v_event.type <> 'lightning' then
    raise exception 'Not a lightning event';
  end if;
  if v_event.status in ('resolved', 'void') then
    raise exception 'Event already settled';
  end if;

  if v_event.status = 'open' then
    perform public.lock_bet_event(p_event_id);
  elsif v_event.status <> 'closed' then
    raise exception 'Event must be open or closed to resolve';
  end if;

  perform public.resolve_bet_event(p_event_id, array[p_winning_option_id]::uuid[]);
end;
$$;

grant execute on function public.quick_resolve_lightning(uuid, uuid) to authenticated;
