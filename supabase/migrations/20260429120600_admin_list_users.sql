create or replace function public.admin_list_users(
  p_search text default null,
  p_role_filter text default null,
  p_banned boolean default null,
  p_min_balance int default null,
  p_max_balance int default null,
  p_limit int default 200,
  p_user_id uuid default null
) returns table (
  id uuid,
  nickname text,
  email text,
  role text,
  is_banned boolean,
  balance int,
  total_bets int,
  correct_bets int,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.nickname,
    u.email::text,
    p.role,
    p.is_banned,
    p.balance,
    p.total_bets,
    p.correct_bets,
    p.created_at
  from public.profiles p
  join auth.users u on u.id = p.id
  where public.is_admin()
    and (p_user_id is null or p.id = p_user_id)
    and (p_search is null or p.nickname ilike '%' || p_search || '%')
    and (p_role_filter is null or p.role = p_role_filter)
    and (p_banned is null or p.is_banned = p_banned)
    and (p_min_balance is null or p.balance >= p_min_balance)
    and (p_max_balance is null or p.balance <= p_max_balance)
  order by p.created_at desc
  limit least(coalesce(p_limit, 200), 500);
$$;

grant execute on function public.admin_list_users(text, text, boolean, int, int, int, uuid) to authenticated;
