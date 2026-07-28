-- Read-optimized, one-row-per-(product, locale) view for the storefront grid
-- and search: aggregates colors/sizes/category slugs and the USD reference
-- "from" price so filtering, sorting and keyset pagination stay simple
-- top-level queries. PostgREST's nested resource embedding can't express
-- "any variant matching color AND size, aggregated across variants" cleanly
-- across three joined tables, hence a dedicated view instead of embedding.
--
-- security_invoker = true: a view has no RLS of its own (only tables do),
-- so access is delegated entirely to the RLS already enabled on products /
-- product_translations / product_variants / prices / product_images /
-- product_categories / categories, which all already restrict reads to the
-- active catalog. The `where p.status = 'active'` below is redundant with
-- that RLS but kept for clarity and as a second layer of defense.

create view product_catalog
  with (security_invoker = true)
as
select
  p.id as product_id,
  p.slug,
  p.is_bestseller,
  p.created_at,
  pt.locale,
  pt.name,
  pt.description,
  pt.seo_title,
  pt.seo_desc,
  (
    select array_agg(distinct c.slug)
    from product_categories pc
    join categories c on c.id = pc.category_id
    where pc.product_id = p.id
  ) as category_slugs,
  (
    select array_agg(distinct v.color)
    from product_variants v
    where v.product_id = p.id and v.color is not null
  ) as colors,
  (
    select array_agg(distinct v.size)
    from product_variants v
    where v.product_id = p.id and v.size is not null
  ) as sizes,
  (
    select min(pr.amount_cents)
    from prices pr
    join product_variants v2 on v2.id = pr.variant_id
    where v2.product_id = p.id and pr.currency = 'USD'
  ) as min_price_usd_cents,
  (
    select pi.url from product_images pi
    where pi.product_id = p.id order by pi.position limit 1
  ) as image_url,
  (
    select pi.alt from product_images pi
    where pi.product_id = p.id order by pi.position limit 1
  ) as image_alt
from products p
join product_translations pt on pt.product_id = p.id
where p.status = 'active';
