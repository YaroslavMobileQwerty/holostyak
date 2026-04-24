-- Phase 7: preview / finalize / delivery / shipping RPCs (SECURITY DEFINER)

-- Preview top-3 for a season (admin only) — no writes
create or replace function public.preview_finalize_season(p_season_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  if not exists (select 1 from public.seasons where id = p_season_id) then
    raise exception 'season_not_found';
  end if;

  return coalesce((
    with agg as (
      select
        b.user_id,
        coalesce(sum(case when b.status = 'won' then b.payout else 0 end), 0)::bigint as season_total_won,
        count(*)::bigint as season_bets,
        count(*) filter (where b.status = 'won')::bigint as season_correct
      from public.bets b
      inner join public.bet_events be on be.id = b.event_id
      inner join public.episodes ep on ep.id = be.episode_id
      where ep.season_id = p_season_id
        and b.status in ('won', 'lost')
      group by b.user_id
    ),
    ranked as (
      select
        a.user_id,
        p.nickname,
        a.season_total_won,
        row_number() over (
          order by
            a.season_total_won desc,
            (case when a.season_bets > 0
              then a.season_correct::double precision / a.season_bets::double precision
              else 0 end) desc,
            p.streak_best desc nulls last,
            p.created_at asc
        ) as place_preview
      from agg a
      inner join public.profiles p on p.id = a.user_id
    )
    select jsonb_build_object(
      'preview',
      coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'user_id', r.user_id,
            'nickname', r.nickname,
            'place_preview', r.place_preview,
            'season_total_won', r.season_total_won
          ) order by r.place_preview
        )
        from ranked r
        where r.place_preview <= 3
      ), '[]'::jsonb)
    )
  ), jsonb_build_object('preview', '[]'::jsonb));
end;
$$;

-- Finalize: compute top-3, insert season_prizes, close season, notify, audit
create or replace function public.finalize_season(p_season_id uuid, p_force boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_season public.seasons%rowtype;
  v_row record;
  v_place int := 0;
  v_trophy text;
  v_prize_id uuid;
  v_prizes jsonb := '[]'::jsonb;
  v_admin_id uuid := auth.uid();
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  select * into v_season from public.seasons where id = p_season_id;
  if not found then
    raise exception 'season_not_found';
  end if;

  if v_season.status = 'upcoming' then
    raise exception 'season_cannot_be_finalized';
  end if;

  if v_season.status = 'finished' and not p_force then
    raise exception 'season_already_finalized';
  end if;

  if exists (select 1 from public.season_prizes sp where sp.season_id = p_season_id) and not p_force then
    raise exception 'prizes_already_awarded';
  end if;

  if p_force then
    delete from public.season_prizes where season_id = p_season_id;
  end if;

  perform public.refresh_leaderboards();

  for v_row in
    with agg as (
      select
        b.user_id,
        coalesce(sum(case when b.status = 'won' then b.payout else 0 end), 0)::bigint as season_total_won,
        count(*)::bigint as season_bets,
        count(*) filter (where b.status = 'won')::bigint as season_correct
      from public.bets b
      inner join public.bet_events be on be.id = b.event_id
      inner join public.episodes ep on ep.id = be.episode_id
      where ep.season_id = p_season_id
        and b.status in ('won', 'lost')
      group by b.user_id
    )
    select
      a.user_id,
      a.season_total_won,
      case
        when a.season_bets > 0
        then a.season_correct::double precision / a.season_bets::double precision
        else 0
      end as acc,
      p.streak_best,
      p.created_at
    from agg a
    inner join public.profiles p on p.id = a.user_id
    order by
      a.season_total_won desc,
      (case when a.season_bets > 0
            then a.season_correct::double precision / a.season_bets::double precision
            else 0 end) desc,
      p.streak_best desc nulls last,
      p.created_at asc
    limit 3
  loop
    v_place := v_place + 1;
    v_trophy := case v_place
      when 1 then 'Чемпіон сезону'
      when 2 then 'Срібний прогнозист'
      when 3 then 'Бронзовий призер'
    end;

    insert into public.season_prizes (season_id, user_id, place, trophy_title, shipping_status)
    values (p_season_id, v_row.user_id, v_place, v_trophy, 'pending')
    returning id into v_prize_id;

    v_prizes := v_prizes || jsonb_build_array(
      jsonb_build_object(
        'id', v_prize_id,
        'user_id', v_row.user_id,
        'place', v_place,
        'trophy_title', v_trophy
      )
    );

    insert into public.notifications (user_id, type, title, body, action_url, metadata)
    values (
      v_row.user_id,
      'season_prize_won',
      'Вітаємо! Ти в топ-3 сезону',
      coalesce('Твоє місце — ' || v_place || '. ' || v_trophy, v_trophy),
      '/prizes',
      jsonb_build_object('season_id', p_season_id, 'place', v_place, 'prize_id', v_prize_id)
    );
  end loop;

  if v_place = 0 then
    raise exception 'no_eligible_players';
  end if;

  update public.seasons
  set status = 'finished', ends_at = coalesce(ends_at, now())
  where id = p_season_id;

  for v_row in
    select p.id
    from public.profiles p
    where p.role = 'admin'
  loop
    insert into public.notifications (user_id, type, title, body, action_url, metadata)
    values (
      v_row.id,
      'admin_prize_season_finalized',
      'Сезон фіналізовано',
      'Призи сезону оновлено. Перевір сторінку призів.',
      '/admin/prizes',
      jsonb_build_object('season_id', p_season_id)
    );
  end loop;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (
    v_admin_id,
    'season_finalized',
    'season',
    p_season_id,
    jsonb_build_object('prizes', v_prizes)
  );

  return jsonb_build_object('season_id', p_season_id, 'prizes', v_prizes);
end;
$$;

-- User submits delivery data once per prize
create or replace function public.submit_delivery_form(p_prize_id uuid, p_form jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.season_prizes%rowtype;
  v_c text;
  v_fn text;
  v_ln text;
  v_ph text;
  v_addr text;
  v_city text;
  v_br text;
  v_pr record;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_row from public.season_prizes where id = p_prize_id for update;
  if not found then
    raise exception 'prize_not_found';
  end if;
  if v_row.user_id <> v_uid then
    raise exception 'not_authorized';
  end if;
  if v_row.delivery_submitted_at is not null then
    raise exception 'delivery_already_submitted';
  end if;

  v_c := p_form->>'carrier';
  if v_c is null or v_c not in ('nova_poshta', 'ukr_poshta', 'manual') then
    raise exception 'invalid_delivery_form';
  end if;
  v_fn := nullif(trim(p_form->>'first_name'), '');
  v_ln := nullif(trim(p_form->>'last_name'), '');
  v_ph := nullif(trim(p_form->>'phone'), '');
  v_addr := nullif(trim(p_form->>'address'), '');
  v_city := nullif(trim(p_form->>'city'), '');
  v_br := nullif(trim(p_form->>'branch_number'), '');

  if v_fn is null or v_ln is null or v_ph is null then
    raise exception 'invalid_delivery_form';
  end if;

  if v_c = 'nova_poshta' then
    if v_city is null or v_br is null then
      raise exception 'invalid_delivery_form';
    end if;
  elsif v_c = 'ukr_poshta' then
    if v_addr is null then
      raise exception 'invalid_delivery_form';
    end if;
  else
    if v_addr is null then
      raise exception 'invalid_delivery_form';
    end if;
  end if;

  update public.season_prizes
  set
    delivery_first_name = v_fn,
    delivery_last_name = v_ln,
    delivery_phone = v_ph,
    delivery_carrier = v_c::public.delivery_carrier,
    delivery_address = v_addr,
    delivery_city = v_city,
    delivery_branch_number = v_br,
    delivery_submitted_at = now(),
    shipping_status = 'awaiting_delivery'
  where id = p_prize_id;

  for v_pr in
    select p.id
    from public.profiles p
    where p.role = 'admin'
  loop
    insert into public.notifications (user_id, type, title, body, action_url, metadata)
    values (
      v_pr.id,
      'prize_delivery_submitted',
      'Нова форма доставки призу',
      'Користувач надіслав адресу для призу',
      '/admin/prizes',
      jsonb_build_object('prize_id', p_prize_id)
    );
  end loop;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (v_uid, 'prize_delivery_submitted', 'season_prize', p_prize_id, p_form);
end;
$$;

create or replace function public.admin_mark_prize_shipped(p_prize_id uuid, p_tracking text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin uuid := auth.uid();
  v_row public.season_prizes%rowtype;
  v_track text := nullif(trim(p_tracking), '');
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  select * into v_row from public.season_prizes where id = p_prize_id;
  if not found then
    raise exception 'prize_not_found';
  end if;

  update public.season_prizes
  set
    shipping_status = 'shipped',
    shipping_tracking_number = v_track
  where id = p_prize_id;

  insert into public.notifications (user_id, type, title, body, action_url, metadata)
  values (
    v_row.user_id,
    'prize_shipped',
    'Приз відправлено',
    case
      when v_track is not null then 'Трек-номер: ' || v_track
      else 'Перевір деталі доставки в розділі «Призи».'
    end,
    '/prizes',
    jsonb_build_object('prize_id', p_prize_id, 'tracking', v_track)
  );

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (v_admin, 'prize_marked_shipped', 'season_prize', p_prize_id, jsonb_build_object('tracking', v_track));
end;
$$;

create or replace function public.admin_set_secret_prize_description(p_prize_id uuid, p_description text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin uuid := auth.uid();
  v_s text := left(trim(p_description), 2000);
  v_ok uuid;
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  update public.season_prizes
  set secret_prize_description = nullif(v_s, '')
  where id = p_prize_id
  returning id into v_ok;

  if v_ok is null then
    raise exception 'prize_not_found';
  end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (v_admin, 'prize_secret_description_set', 'season_prize', p_prize_id, jsonb_build_object('len', char_length(v_s)));
end;
$$;

create or replace function public.admin_set_prize_delivered(p_prize_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin uuid := auth.uid();
  v_row public.season_prizes%rowtype;
begin
  if not public.is_admin() then
    raise exception 'not_authorized';
  end if;

  select * into v_row from public.season_prizes where id = p_prize_id;
  if not found then
    raise exception 'prize_not_found';
  end if;

  update public.season_prizes
  set shipping_status = 'delivered'
  where id = p_prize_id;

  insert into public.notifications (user_id, type, title, body, action_url, metadata)
  values (
    v_row.user_id,
    'prize_delivered',
    'Секретний приз розкрито',
    'Статус доставки: отримано. Тут можна переглянути опис сюрпризу.',
    '/prizes',
    jsonb_build_object('prize_id', p_prize_id)
  );

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (v_admin, 'prize_marked_delivered', 'season_prize', p_prize_id, '{}'::jsonb);
end;
$$;

revoke all on function public.preview_finalize_season(uuid) from public;
revoke all on function public.finalize_season(uuid, boolean) from public;
revoke all on function public.submit_delivery_form(uuid, jsonb) from public;
revoke all on function public.admin_mark_prize_shipped(uuid, text) from public;
revoke all on function public.admin_set_secret_prize_description(uuid, text) from public;
revoke all on function public.admin_set_prize_delivered(uuid) from public;

grant execute on function public.preview_finalize_season(uuid) to authenticated;
grant execute on function public.finalize_season(uuid, boolean) to authenticated;
grant execute on function public.submit_delivery_form(uuid, jsonb) to authenticated;
grant execute on function public.admin_mark_prize_shipped(uuid, text) to authenticated;
grant execute on function public.admin_set_secret_prize_description(uuid, text) to authenticated;
grant execute on function public.admin_set_prize_delivered(uuid) to authenticated;
