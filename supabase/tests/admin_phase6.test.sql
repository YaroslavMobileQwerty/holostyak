begin;
select plan(20);

select has_column('public'::name, 'profiles'::name, 'is_banned'::name);
select has_table('public'::name, 'admin_broadcast_log'::name);

select has_function('public'::name, 'admin_ban_user', array['uuid', 'text']::name[]);
select has_function('public'::name, 'admin_unban_user', array['uuid']::name[]);
select has_function('public'::name, 'admin_set_role', array['uuid', 'text']::name[]);
select has_function('public'::name, 'admin_force_set_nickname', array['uuid', 'text']::name[]);
select has_function('public'::name, 'admin_broadcast_preview_count', array['jsonb']::name[]);
select has_function('public'::name, 'admin_broadcast_notification', array['text', 'text', 'jsonb']::name[]);
select has_function('public'::name, 'admin_update_app_setting', array['text', 'jsonb']::name[]);
select has_function('public'::name, 'admin_dashboard_stats', array[]::name[]);
select has_function(
  'public'::name,
  'admin_create_season',
  array['integer', 'text', 'text', 'timestamp with time zone', 'timestamp with time zone']::name[]
);
select has_function(
  'public'::name,
  'admin_update_season',
  array['uuid', 'integer', 'text', 'timestamp with time zone', 'timestamp with time zone']::name[]
);

select has_function('public'::name, 'admin_set_season_status', array['uuid', 'text']::name[]);
select has_function('public'::name, 'admin_create_bachelor', array['uuid', 'text', 'text', 'text', 'integer']::name[]);
select has_function('public'::name, 'admin_update_bachelor', array['uuid', 'text', 'text', 'text', 'integer']::name[]);
select has_function(
  'public'::name,
  'admin_create_participant',
  array['uuid', 'text', 'uuid', 'integer', 'text', 'text', 'text', 'text', 'uuid']::name[]
);
select has_function(
  'public'::name,
  'admin_update_participant',
  array['uuid', 'text', 'uuid', 'integer', 'text', 'text', 'text', 'text', 'uuid']::name[]
);
select has_function(
  'public'::name,
  'admin_list_users',
  array['text', 'text', 'boolean', 'integer', 'integer', 'integer', 'uuid']::name[]
);

select * from finish();
rollback;
