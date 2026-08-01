-- Orders and order line items. Line items are a frozen snapshot of the
-- product at purchase time: sku/name/unit_price_cents/variant_label/image_url
-- are plain columns written once, never re-derived from products or
-- product_variants. variant_id/product_id are kept only as nullable,
-- on-delete-set-null references for analytics/traceability — never used to
-- resolve price or name.

create sequence order_number_seq;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references customers (id) on delete restrict,
  contact_email text not null,
  contact_phone text,
  status order_status not null default 'pending',
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  subtotal_cents integer not null check (subtotal_cents >= 0),
  shipping_cents integer not null check (shipping_cents >= 0),
  tax_cents integer not null check (tax_cents >= 0),
  discount_cents integer not null default 0 check (discount_cents >= 0),
  total_cents integer not null check (total_cents >= 0),
  discount_code_id uuid references discount_codes (id) on delete set null,
  shipping_address jsonb not null,
  billing_address jsonb,
  payment_provider payment_provider not null,
  payment_ref text,
  printful_order_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_cents = subtotal_cents + shipping_cents + tax_cents - discount_cents)
);

comment on column orders.customer_id is 'on delete restrict: never lose financial history even if the account is removed.';

create index orders_customer_id_idx on orders (customer_id);

create function set_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := 'BTQ-' || to_char(nextval('order_number_seq'), 'FM000000');
  end if;
  return new;
end;
$$;

create trigger orders_set_order_number
  before insert on orders
  for each row
  execute function set_order_number();

create trigger orders_set_updated_at
  before update on orders
  for each row
  execute function set_updated_at();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  -- Denormalized for RLS performance (avoids a join to orders on every row).
  customer_id uuid not null,
  -- Traceability only — never used to resolve price or name.
  variant_id uuid references product_variants (id) on delete set null,
  product_id uuid references products (id) on delete set null,
  printful_variant_id text,
  sku text not null,
  name text not null,
  variant_label text,
  image_url text,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  line_total_cents integer not null check (line_total_cents >= 0),
  created_at timestamptz not null default now(),
  check (line_total_cents = unit_price_cents * quantity)
);

create index order_items_order_id_idx on order_items (order_id);
create index order_items_customer_id_idx on order_items (customer_id);

create function set_order_item_customer_id()
returns trigger
language plpgsql
as $$
begin
  select customer_id into new.customer_id from orders where id = new.order_id;
  return new;
end;
$$;

create trigger order_items_set_customer_id
  before insert on order_items
  for each row
  execute function set_order_item_customer_id();

-- ---------------------------------------------------------------------------
-- Row Level Security — read-only for customers on their own orders. Orders
-- are created exclusively by the checkout Server Action via the service_role
-- key (which bypasses RLS) after payment has been verified, so there are no
-- insert/update/delete policies here.
-- ---------------------------------------------------------------------------

alter table orders enable row level security;
alter table order_items enable row level security;

create policy "read own orders"
  on orders for select
  to authenticated
  using (customer_id = auth.uid());

create policy "read own order items"
  on order_items for select
  to authenticated
  using (customer_id = auth.uid());
