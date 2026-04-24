-- Refresh leaderboards (CONCURRENTLY when possible; unique indexes exist on user_id)
create or replace function public.refresh_leaderboards()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    refresh materialized view concurrently public.leaderboard_all_time;
  exception when others then
    refresh materialized view public.leaderboard_all_time;
  end;
  begin
    refresh materialized view concurrently public.leaderboard_season;
  exception when others then
    refresh materialized view public.leaderboard_season;
  end;
  begin
    refresh materialized view concurrently public.leaderboard_week;
  exception when others then
    refresh materialized view public.leaderboard_week;
  end;
end;
$$;

revoke all on function public.refresh_leaderboards() from public;

-- Optional pg_cron (enable extension in Dashboard first):
-- select cron.schedule(
--   'refresh-leaderboards',
--   '*/5 * * * *',
--   $$ select public.refresh_leaderboards(); $$
-- );
