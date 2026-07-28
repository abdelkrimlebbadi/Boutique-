-- Product image storage. No Supabase Storage bucket existed before this —
-- product_images.url previously only ever held externally-hosted URLs.

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);

create policy "public read product images"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-images');

-- No insert/update/delete policy for anon/authenticated: all writes go
-- through the admin uploadProductImage Server Action using service_role,
-- which bypasses storage RLS entirely, exactly like every other admin
-- write path.
