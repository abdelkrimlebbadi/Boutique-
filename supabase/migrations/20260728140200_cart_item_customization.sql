-- Attaches an optional customization (uploaded image + text, positioned on
-- a print-area-sized canvas) to a cart line. custom_design_image_url is the
-- raw upload; custom_design_state is the Konva layer positions/text in the
-- SAME pixel space as product_variants.print_area_width_px/height_px (no
-- DPI conversion needed anywhere downstream); custom_design_print_file_url
-- is the flattened print-ready export, populated only right before payment
-- (see src/components/checkout/DesignCompositor.tsx) — never at add-to-cart
-- time, so an abandoned cart never pays for anything, even though the
-- render itself is free (it runs in the visitor's own browser).

alter table cart_items
  add column custom_design_image_url text,
  add column custom_design_state jsonb,
  add column custom_design_print_file_url text;

-- The existing unique(cart_id, variant_id) would wrongly merge two
-- different customizations of the same variant into one line with an
-- incremented quantity. Replace it with a partial index that keeps the
-- original dedup behavior for plain (non-customized) items and allows
-- unlimited distinct rows once a design is attached — addToCart never
-- merges into an existing customized line, it always inserts a new one.
-- The constraint is looked up by its columns rather than assumed by name,
-- since it was declared inline (`unique (cart_id, variant_id)`) in
-- 20260728100400_cart.sql and its Postgres-generated name is an
-- implementation detail, not something to hardcode.
do $$
declare
  v_constraint_name text;
begin
  select conname into v_constraint_name
  from pg_constraint
  where conrelid = 'cart_items'::regclass
    and contype = 'u'
    and array_length(conkey, 1) = 2
    and conkey <@ ( -- conkey is smallint[] (matches pg_attribute.attnum), no cast needed
      select array_agg(attnum)
      from pg_attribute
      where attrelid = 'cart_items'::regclass
        and attname in ('cart_id', 'variant_id')
    );

  if v_constraint_name is not null then
    execute format('alter table cart_items drop constraint %I', v_constraint_name);
  end if;
end;
$$;

create unique index cart_items_variant_unique
  on cart_items (cart_id, variant_id)
  where custom_design_image_url is null;
