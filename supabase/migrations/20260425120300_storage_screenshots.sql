insert into storage.buckets (id, name, public)
  values ('screenshots', 'screenshots', false)
on conflict (id) do nothing;

create policy "screenshots insert own prefix"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "screenshots select own or admin"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'screenshots'
    and (
      public.is_admin()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );

create policy "screenshots update own prefix"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "screenshots delete own prefix"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
