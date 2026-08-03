-- Extends create_order_with_items (20260728120300) to copy each item's
-- custom_design_url from p_items into order_items. Signature is unchanged
-- (p_items already carries arbitrary per-item fields as jsonb), so
-- CREATE OR REPLACE is sufficient — same SECURITY DEFINER/search_path/
-- revoke posture as the original.

create or replace function create_order_with_items(
  p_customer_id uuid,
  p_cart_id uuid,
  p_contact_email text,
  p_contact_phone text,
  p_currency text,
  p_subtotal_cents integer,
  p_shipping_cents integer,
  p_tax_cents integer,
  p_discount_cents integer,
  p_total_cents integer,
  p_discount_code_id uuid,
  p_shipping_address jsonb,
  p_billing_address jsonb,
  p_payment_provider payment_provider,
  p_items jsonb
)
returns orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders;
begin
  insert into orders (
    customer_id, contact_email, contact_phone, currency,
    subtotal_cents, shipping_cents, tax_cents, discount_cents, total_cents,
    discount_code_id, shipping_address, billing_address, payment_provider
  )
  values (
    p_customer_id, p_contact_email, p_contact_phone, p_currency,
    p_subtotal_cents, p_shipping_cents, p_tax_cents, p_discount_cents, p_total_cents,
    p_discount_code_id, p_shipping_address, p_billing_address, p_payment_provider
  )
  returning * into v_order;

  insert into order_items (
    order_id, variant_id, product_id, printful_variant_id,
    sku, name, variant_label, image_url,
    unit_price_cents, quantity, line_total_cents, custom_design_url
  )
  select
    v_order.id,
    (item ->> 'variant_id')::uuid,
    (item ->> 'product_id')::uuid,
    item ->> 'printful_variant_id',
    item ->> 'sku',
    item ->> 'name',
    item ->> 'variant_label',
    item ->> 'image_url',
    (item ->> 'unit_price_cents')::integer,
    (item ->> 'quantity')::integer,
    (item ->> 'line_total_cents')::integer,
    item ->> 'custom_design_url'
  from jsonb_array_elements(p_items) as item;

  if p_discount_code_id is not null then
    update discount_codes set used_count = used_count + 1 where id = p_discount_code_id;
  end if;

  update carts set status = 'converted' where id = p_cart_id and status = 'active';

  return v_order;
end;
$$;

revoke execute on function create_order_with_items from public, anon, authenticated;
