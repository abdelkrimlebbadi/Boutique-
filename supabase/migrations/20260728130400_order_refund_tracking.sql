-- Tracks how much of an order was actually refunded. The existing
-- order_status.'refunded' value is reused for both full and partial
-- refunds (a dedicated 'partially_refunded' enum value would ripple into
-- webhook handlers and the storefront's status display for little gain).
alter table orders
  add column refunded_amount_cents integer,
  add column refunded_at timestamptz;
