-- Úložiště fotek inzerátů (Supabase Storage). Veřejné čtení, nahrávat může přihlášený uživatel
-- do složky svého vozu; mazat jen vlastní soubory.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vehicle-photos', 'vehicle-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "vehicle photos public read" on storage.objects for select
  using (bucket_id = 'vehicle-photos');
create policy "vehicle photos upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'vehicle-photos');
create policy "vehicle photos delete own" on storage.objects for delete to authenticated
  using (bucket_id = 'vehicle-photos' and owner = (select auth.uid()));
