begin;
select plan(6);

select has_table('public'::name, 'achievements'::name);
select has_table('public'::name, 'user_achievements'::name);
select has_function('public'::name, 'evaluate_user_achievements', array['uuid']::name[]);
select has_materialized_view('public'::name, 'leaderboard_all_time'::name);
select has_materialized_view('public'::name, 'leaderboard_season'::name);
select has_materialized_view('public'::name, 'leaderboard_week'::name);

select * from finish();
rollback;
