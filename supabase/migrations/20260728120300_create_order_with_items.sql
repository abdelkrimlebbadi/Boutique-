-- Atomic order creation: inserts the order + its line items, bumps the
-- discount code's usage counter, and marks the source cart converted, all
-- in one transaction — avoids ever having an orders row without its items
-- if a later insert in the sequence were to fail. Same posture as
-- validate_discount_code: SECURITY DEFINER, EXECUTE revoked from
-- PUBLIC/anon/authenticated. Only service_role (used exclusively by the
-- startPayment Server Action) may call this — without the revoke, the
-- anon key could forge arbitrary orders, since Postgres grants EXECUTE to
-- PUBLIC by default on every new function.

create function create_order_with_items(
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
    unit_price_cents, quantity, line_total_cents
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
    (item ->> 'line_total_cents')::integer
  from jsonb_array_elements(p_items) as item;

  if p_discount_code_id is not null then
    update discount_codes set used_count = used_count + 1 where id = p_discount_code_id;
  end if;

  update carts set status = 'converted' where id = p_cart_id and status = 'active';

  return v_order;
end;
$$;

revoke execute on function create_order_with_items from public, anon, authenticated;
