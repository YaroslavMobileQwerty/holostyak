begin;
select plan(6);

select has_table('public'::name, 'coin_purchase_requests'::name);
select has_table('public'::name, 'coin_transactions'::name);
select has_table('public'::name, 'admin_audit_log'::name);
select has_table('public'::name, 'app_settings'::name);
select has_function('public'::name, 'submit_purchase_request', array['integer', 'text', 'text']::name[]);
select ok(
  exists (
    select 1
    from pg_trigger t
    join pg_class c on c.oid = t.tgrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'coin_transactions'
      and not t.tgisinternal
      and t.tgname = 'trg_sync_balance_after_coin_tx'
  ),
  'trg_sync_balance_after_coin_tx on coin_transactions'
);

select * from finish();
rollback;
