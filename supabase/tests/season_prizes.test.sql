begin;
select plan(5);

select has_table('public'::name, 'season_prizes'::name);

select has_function(
  'public'::name,
  'finalize_season',
  array['uuid', 'boolean']::name[]
);

select has_function(
  'public'::name,
  'submit_delivery_form',
  array['uuid', 'jsonb']::name[]
);

select has_function(
  'public'::name,
  'admin_mark_prize_shipped',
  array['uuid', 'text']::name[]
);

select has_function(
  'public'::name,
  'preview_finalize_season',
  array['uuid']::name[]
);

select * from finish();
rollback;
