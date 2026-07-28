-- Atomic product save: the admin ProductForm always submits the complete
-- desired state of every child collection (not an incremental diff), so
-- each child table is fully replaced (delete-then-reinsert) inside one
-- transaction — same posture as create_order_with_items. service_role
-- only (EXECUTE revoked from anon/authenticated below), since there are no
-- write policies on any catalog table for anyone else.

create function admin_save_product(
  p_product_id uuid,
  p_slug text,
  p_status product_status,
  p_base_cost_usd integer,
  p_printful_variant_id text,
  p_is_bestseller boolean,
  p_translations jsonb,
  p_variants jsonb,
  p_category_ids uuid[],
  p_images jsonb
)
returns products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product products;
  v_variant_id uuid;
  variant jsonb;
  price jsonb;
  keep_variant_ids uuid[];
begin
  if p_product_id is null then
    insert into products (slug, status, base_cost_usd, printful_variant_id, is_bestseller)
    values (p_slug, p_status, p_base_cost_usd, p_printful_variant_id, p_is_bestseller)
    returning * into v_product;
  else
    update products set
      slug = p_slug,
      status = p_status,
      base_cost_usd = p_base_cost_usd,
      printful_variant_id = p_printful_variant_id,
      is_bestseller = p_is_bestseller
    where id = p_product_id
    returning * into v_product;

    if not found then
      raise exception 'admin_save_product: product % not found', p_product_id;
    end if;
  end if;

  delete from product_translations where product_id = v_product.id;
  insert into product_translations (product_id, locale, name, description, seo_title, seo_desc)
  select v_product.id, t ->> 'locale', t ->> 'name', t ->> 'description', t ->> 'seo_title', t ->> 'seo_desc'
  from jsonb_array_elements(p_translations) as t;

  select array_agg((v ->> 'id')::uuid)
  into keep_variant_ids
  from jsonb_array_elements(p_variants) as v
  where v ->> 'id' is not null;

  delete from product_variants
   where product_id = v_product.id
     and (keep_variant_ids is null or id <> all (keep_variant_ids));

  for variant in select * from jsonb_array_elements(p_variants) loop
    if variant ->> 'id' is not null then
      update product_variants set
        sku = variant ->> 'sku',
        size = variant ->> 'size',
        color = variant ->> 'color',
        printful_variant_id = variant ->> 'printful_variant_id',
        stock_policy = (variant ->> 'stock_policy')::stock_policy,
        weight_grams = nullif(variant ->> 'weight_grams', '')::integer
      where id = (variant ->> 'id')::uuid
      returning id into v_variant_id;
    else
      insert into product_variants (
        product_id, sku, size, color, printful_variant_id, stock_policy, weight_grams
      )
      values (
        v_product.id,
        variant ->> 'sku',
        variant ->> 'size',
        variant ->> 'color',
        variant ->> 'printful_variant_id',
        (variant ->> 'stock_policy')::stock_policy,
        nullif(variant ->> 'weight_grams', '')::integer
      )
      returning id into v_variant_id;
    end if;

    delete from prices where variant_id = v_variant_id;
    for price in select * from jsonb_array_elements(variant -> 'prices') loop
      insert into prices (variant_id, currency, amount_cents, compare_at_cents)
      values (
        v_variant_id,
        price ->> 'currency',
        (price ->> 'amount_cents')::integer,
        nullif(price ->> 'compare_at_cents', '')::integer
      );
    end loop;
  end loop;

  delete from product_categories where product_id = v_product.id;
  if p_category_ids is not null and array_length(p_category_ids, 1) > 0 then
    insert into product_categories (product_id, category_id)
    select v_product.id, unnest(p_category_ids);
  end if;

  delete from product_images where product_id = v_product.id;
  insert into product_images (product_id, url, alt, position)
  select v_product.id, i ->> 'url', i ->> 'alt', (i ->> 'position')::integer
  from jsonb_array_elements(p_images) as i;

  return v_product;
end;
$$;

revoke execute on function admin_save_product from public, anon, authenticated;
