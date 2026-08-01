-- Enumerations used across the catalog, cart, order and payment schema.
-- payment_provider is intentionally limited to providers available in Morocco
-- (see CLAUDE.md rule 2: Stripe is forbidden) — it cannot be introduced by mistake,
-- inserting 'stripe' will fail at the database level.

create type product_status as enum ('draft', 'active', 'archived');

create type stock_policy as enum ('made_to_order', 'in_stock', 'out_of_stock');

create type cart_status as enum ('active', 'converted');

create type order_status as enum (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'failed'
);

create type payment_provider as enum ('paypal', 'youcan_pay');

create type discount_type as enum ('fixed', 'percentage');

create type webhook_provider as enum ('paypal', 'youcan_pay', 'printful');
