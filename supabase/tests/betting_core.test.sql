begin;
select plan(8);

select has_table('public'::name, 'bet_events'::name);
select has_table('public'::name, 'bet_options'::name);
select has_table('public'::name, 'bets'::name);

select has_function(
  'public'::name,
  'place_bet',
  array['uuid', 'uuid', 'integer']::name[]
);

select has_function(
  'public'::name,
  'resolve_bet_event',
  array['uuid', 'uuid[]']::name[]
);

select has_function(
  'public'::name,
  'void_bet_event',
  array['uuid', 'text']::name[]
);

select ok(
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'coin_transactions_one_bet_placed_per_ref'
  ),
  'partial unique bet_placed on ref_id'
);

select * from finish();
rollback;
