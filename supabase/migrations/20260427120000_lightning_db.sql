-- Lightning bet_events: generated flag + partial index (type = 'lightning', not category)
alter table public.bet_events
  add column if not exists is_lightning boolean
  generated always as (type = 'lightning') stored;

create index if not exists bet_events_lightning_episode_status_idx
  on public.bet_events (episode_id, status, closes_at)
  where type = 'lightning';
