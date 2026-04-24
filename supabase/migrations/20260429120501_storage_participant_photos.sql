insert into storage.buckets (id, name, public)
  values ('participant-photos', 'participant-photos', true)
  on conflict (id) do nothing;

create policy "participant_photos_select_public"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'participant-photos');

create policy "participant_photos_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'participant-photos' and public.is_admin());

create policy "participant_photos_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'participant-photos' and public.is_admin())
  with check (bucket_id = 'participant-photos' and public.is_admin());

create policy "participant_photos_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'participant-photos' and public.is_admin());
