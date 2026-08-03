-- Storage for customer-uploaded design assets (raw uploads + the final
-- composited print file). Deliberately separate from product-images: this
-- bucket holds visitor-submitted content tied to a cart, not admin-curated
-- product photography.

insert into storage.buckets (id, name, public) values ('custom-designs', 'custom-designs', true);

create policy "public read custom designs"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'custom-designs');

-- No insert/update/delete policy for anon/authenticated: uploadDesignImage
-- and finalizeCartItemDesign write via service_role (bypassing storage RLS),
-- exactly like every other write path in this project. The real gate against
-- abuse is the server-side magic-byte/dimension validation in
-- src/lib/uploads/sniff-image.ts, applied before any object is written —
-- not row-level access control on the bucket itself.
