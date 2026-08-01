-- Carts. Every visitor — anonymous (Supabase Anonymous Auth) or signed in —
-- has a stable auth.uid(), so customer_id is always set and "merging" a cart
-- at login is a non-event: the same auth.uid() (and therefore the same cart)
-- carries over automatically when an anonymous user is upgraded to a real
-- account via linkIdentity.

create table carts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  status cart_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- At most one active cart per customer.
create unique index carts_one_active_per_customer
  on carts (customer_id)
  where status = 'active';

create trigger carts_set_updated_at
  before update on carts
  for each row
  execute function set_updated_at();

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts (id) on delete cascade,
  variant_id uuid not null references product_variants (id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

-- Requirement: index on cart_items.cart_id. Already satisfied by the
-- leading column of the unique (cart_id, variant_id) constraint above,
-- so no separate index is created here.

create trigger cart_items_set_updated_at
  before update on cart_items
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — cart CRUD happens directly from a Server Action
-- running with the visitor's own session (anonymous or real), so the
-- policies below grant full ownership-scoped access rather than read-only.
-- ---------------------------------------------------------------------------

alter table carts enable row level security;
alter table cart_items enable row level security;

create policy "manage own cart"
  on carts for all
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "manage own cart items"
  on cart_items for all
  to authenticated
  using (exists (
    select 1 from carts c
    where c.id = cart_items.cart_id and c.customer_id = auth.uid()
  ))
  with check (exists (
    select 1 from carts c
    where c.id = cart_items.cart_id and c.customer_id = auth.uid()
  ));
