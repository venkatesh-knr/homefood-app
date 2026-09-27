-- HomeFood · private photo storage
-- Photos live in one private bucket, in a folder named after the household id:
--   dish-photos/<household_id>/<file>
-- Only members of that household can read or write their folder. The app strips
-- location (GPS) data from photos before upload and shows them via short-lived signed links.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('dish-photos', 'dish-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy dish_photos_read on storage.objects for select to authenticated
  using (bucket_id = 'dish-photos' and (storage.foldername(name))[1] = public.my_household_id()::text);

create policy dish_photos_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'dish-photos' and (storage.foldername(name))[1] = public.my_household_id()::text);

create policy dish_photos_update on storage.objects for update to authenticated
  using (bucket_id = 'dish-photos' and (storage.foldername(name))[1] = public.my_household_id()::text);

create policy dish_photos_delete on storage.objects for delete to authenticated
  using (bucket_id = 'dish-photos' and (storage.foldername(name))[1] = public.my_household_id()::text);
