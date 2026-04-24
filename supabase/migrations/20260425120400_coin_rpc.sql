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

create or replace function public.approve_purchase_request(
  request_id uuid,
  p_approved_amount int,
  admin_note text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.coin_purchase_requests%rowtype;
  v_old int;
  v_new int;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if p_approved_amount <= 0 then
    raise exception 'Invalid approved amount';
  end if;

  select * into v_req from public.coin_purchase_requests
  where id = request_id
  for update;

  if not FOUND then
    raise exception 'Request not found';
  end if;
  if v_req.status <> 'pending' then
    raise exception 'Request is not pending';
  end if;

  v_old := coalesce((
    select sum(ct.delta) from public.coin_transactions ct
    where ct.user_id = v_req.user_id
  ), 0);
  v_new := v_old + p_approved_amount;

  update public.coin_purchase_requests
  set status = 'approved',
      approved_amount = p_approved_amount,
      admin_comment = admin_note,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = request_id;

  insert into public.coin_transactions (
    user_id, delta, balance_after, kind, ref_id, admin_id, note
  ) values (
    v_req.user_id, p_approved_amount, v_new, 'purchase_approved',
    request_id, auth.uid(), admin_note
  );

  insert into public.admin_audit_log (
    admin_id, action, target_type, target_id, payload
  ) values (
    auth.uid(),
    'purchase_approved',
    'coin_purchase_request',
    request_id,
    jsonb_build_object(
      'approved_amount', p_approved_amount,
      'user_id', v_req.user_id,
      'note', admin_note
    )
  );

  insert into public.notifications (user_id, type, title, body)
  values (
    v_req.user_id,
    'purchase_approved',
    'Поповнення підтверджено',
    format('Нараховано %s балів за ваш донат. Дякуємо за підтримку ЗСУ!', p_approved_amount)
  );
end;
$$;

create or replace function public.reject_purchase_request(
  request_id uuid,
  reason text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.coin_purchase_requests%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  select * into v_req from public.coin_purchase_requests
  where id = request_id
  for update;

  if not FOUND then
    raise exception 'Request not found';
  end if;
  if v_req.status <> 'pending' then
    raise exception 'Request is not pending';
  end if;

  update public.coin_purchase_requests
  set status = 'rejected',
      admin_comment = reason,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = request_id;

  insert into public.admin_audit_log (
    admin_id, action, target_type, target_id, payload
  ) values (
    auth.uid(),
    'purchase_rejected',
    'coin_purchase_request',
    request_id,
    jsonb_build_object('user_id', v_req.user_id, 'reason', reason)
  );

  insert into public.notifications (user_id, type, title, body)
  values (
    v_req.user_id,
    'purchase_rejected',
    'Заявку відхилено',
    coalesce(nullif(trim(reason), ''), 'Ваша заявку на поповнення відхилено. Зверніться до підтримки за деталями.')
  );
end;
$$;

create or replace function public.grant_coins_manual(
  target_user_id uuid,
  delta int,
  note text
) returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old int;
  v_new int;
  v_kind text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if delta = 0 then
    raise exception 'Delta must be non-zero';
  end if;
  if note is null or trim(note) = '' then
    raise exception 'Note is required';
  end if;

  if not exists (select 1 from public.profiles p where p.id = target_user_id) then
    raise exception 'User not found';
  end if;

  v_old := coalesce((
    select sum(ct.delta) from public.coin_transactions ct
    where ct.user_id = target_user_id
  ), 0);
  v_new := v_old + delta;

  if v_new < 0 then
    raise exception 'Balance would become negative';
  end if;

  v_kind := case when delta > 0 then 'admin_grant' else 'admin_deduct' end;

  insert into public.coin_transactions (
    user_id, delta, balance_after, kind, admin_id, note
  ) values (
    target_user_id, delta, v_new, v_kind, auth.uid(), note
  );

  insert into public.admin_audit_log (
    admin_id, action, target_type, target_id, payload
  ) values (
    auth.uid(),
    v_kind,
    'profile',
    target_user_id,
    jsonb_build_object('delta', delta, 'note', note, 'balance_after', v_new)
  );
end;
$$;

grant execute on function public.submit_purchase_request(int, text, text) to authenticated;
grant execute on function public.approve_purchase_request(uuid, int, text) to authenticated;
grant execute on function public.reject_purchase_request(uuid, text) to authenticated;
grant execute on function public.grant_coins_manual(uuid, int, text) to authenticated;
