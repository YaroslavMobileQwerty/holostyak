create or replace function public.admin_ban_user(p_target_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_n int;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_target_id = auth.uid() then raise exception 'Cannot ban self'; end if;
  if p_reason is null or length(trim(p_reason)) < 3 then raise exception 'Reason required'; end if;

  update public.profiles set is_banned = true where id = p_target_id;
  get diagnostics v_n = row_count;
  if v_n = 0 then raise exception 'User not found'; end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (auth.uid(), 'user_banned', 'profile', p_target_id, jsonb_build_object('reason', p_reason));

  insert into public.notifications (user_id, type, title, body, action_url)
  values (
    p_target_id, 'admin_message', 'Обмеження акаунта',
    'Ваш акаунт обмежено. Деталі: ' || left(trim(p_reason), 500),
    '/profile'
  );
end;
$$;

create or replace function public.admin_unban_user(p_target_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  update public.profiles set is_banned = false where id = p_target_id;
  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (auth.uid(), 'user_unbanned', 'profile', p_target_id, '{}'::jsonb);
end;
$$;

create or replace function public.admin_set_role(p_target_id uuid, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_count int;
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if p_role not in ('user', 'admin') then raise exception 'Invalid role'; end if;
  if p_target_id = auth.uid() then raise exception 'Cannot change own role'; end if;

  if p_role = 'user' and exists (select 1 from public.profiles p where p.id = p_target_id and p.role = 'admin') then
    select count(*) into v_admin_count from public.profiles where role = 'admin';
    if v_admin_count <= 1 then raise exception 'Cannot demote last admin'; end if;
  end if;

  update public.profiles set role = p_role where id = p_target_id;
  if not found then raise exception 'User not found'; end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (auth.uid(), 'role_changed', 'profile', p_target_id, jsonb_build_object('role', p_role));
end;
$$;

create or replace function public.admin_force_set_nickname(p_target_id uuid, p_nickname text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_trim text := trim(p_nickname);
begin
  if not public.is_admin() then raise exception 'Not authorized'; end if;
  if v_trim is null or length(v_trim) < 2 then raise exception 'Invalid nickname'; end if;

  update public.profiles set nickname = v_trim where id = p_target_id;
  if not found then raise exception 'User not found'; end if;

  insert into public.admin_audit_log (admin_id, action, target_type, target_id, payload)
  values (auth.uid(), 'nickname_forced', 'profile', p_target_id, jsonb_build_object('nickname', v_trim));
exception
  when unique_violation then
    raise exception 'Nickname already taken' using errcode = '23505';
end;
$$;

grant execute on function public.admin_ban_user(uuid, text) to authenticated;
grant execute on function public.admin_unban_user(uuid) to authenticated;
grant execute on function public.admin_set_role(uuid, text) to authenticated;
grant execute on function public.admin_force_set_nickname(uuid, text) to authenticated;
