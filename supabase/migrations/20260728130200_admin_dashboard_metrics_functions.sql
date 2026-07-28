-- Read-only aggregation functions for the admin dashboard/customers view.
-- Plain query modules handle simple reads elsewhere in this codebase; these
-- three exist only because the required GROUP BY/window aggregation isn't
-- expressible through the supabase-js .from() builder. Not multi-table
-- writes, so no SECURITY DEFINER is needed, but EXECUTE is still revoked
-- from anon/authenticated as defense in depth (revenue/customer data).

-- "Valid" order set used consistently across all three: excludes pending
-- (never paid), cancelled/failed (never paid), and refunded (money went
-- back out).
create function admin_daily_revenue(p_start date, p_end date)
returns table (day date, currency text, order_count integer, total_cents bigint)
language sql
stable
as $$
  select
    date_trunc('day', created_at)::date as day,
    currency,
    count(*)::integer as order_count,
    sum(total_cents)::bigint as total_cents
  from orders
  where status in ('paid', 'processing', 'shipped', 'delivered')
    and created_at >= p_start
    and created_at < p_end + 1
  group by 1, 2
  order by 1, 2;
$$;

create function admin_top_products(p_start date, p_end date, p_limit integer default 10)
returns table (product_key text, name text, quantity bigint, revenue_cents bigint)
language sql
stable
as $$
  select
    coalesce(oi.product_id::text, oi.sku) as product_key,
    max(oi.name) as name,
    sum(oi.quantity)::bigint as quantity,
    sum(oi.line_total_cents)::bigint as revenue_cents
  from order_items oi
  join orders o on o.id = oi.order_id
  where o.status in ('paid', 'processing', 'shipped', 'delivered')
    and o.created_at >= p_start
    and o.created_at < p_end + 1
  group by 1
  order by revenue_cents desc
  limit p_limit;
$$;

-- Derived from orders, not the raw customers table: customers.full_name
-- and auth.users.email are essentially always empty for guest/anonymous
-- checkout. display_name/contact_email come from each customer's most
-- recent order instead. lifetime_totals is never unified into one
-- currency, same rule as admin_daily_revenue.
--
-- order_count/lifetime_totals/last_order_at are all scoped to the same
-- "valid" order set as admin_daily_revenue/admin_top_products (paid or
-- beyond) — a customer with only a pending/abandoned order should not show
-- up with inflated lifetime value. The full, unfiltered order history
-- (including pending/failed) is still visible on that customer's detail
-- page, which queries `orders` directly with no status filter.
create function admin_customer_summaries(p_cursor timestamptz, p_limit integer default 50)
returns table (
  customer_id uuid,
  display_name text,
  contact_email text,
  order_count integer,
  lifetime_totals jsonb,
  last_order_at timestamptz
)
language sql
stable
as $$
  with valid_orders as (
    select * from orders where status in ('paid', 'processing', 'shipped', 'delivered')
  ),
  per_customer as (
    select o.customer_id, count(*)::integer as order_count, max(o.created_at) as last_order_at
    from valid_orders o
    group by o.customer_id
  ),
  totals as (
    select customer_id, jsonb_object_agg(currency, total_cents) as lifetime_totals
    from (
      select customer_id, currency, sum(total_cents) as total_cents
      from valid_orders
      group by customer_id, currency
    ) sub
    group by customer_id
  ),
  latest as (
    select distinct on (o.customer_id)
      o.customer_id, o.contact_email, o.shipping_address ->> 'fullName' as display_name
    from valid_orders o
    order by o.customer_id, o.created_at desc
  )
  select pc.customer_id, latest.display_name, latest.contact_email,
         pc.order_count, totals.lifetime_totals, pc.last_order_at
  from per_customer pc
  join latest on latest.customer_id = pc.customer_id
  join totals on totals.customer_id = pc.customer_id
  where p_cursor is null or pc.last_order_at < p_cursor
  order by pc.last_order_at desc
  limit p_limit;
$$;

revoke execute on function admin_daily_revenue from public, anon, authenticated;
revoke execute on function admin_top_products from public, anon, authenticated;
revoke execute on function admin_customer_summaries from public, anon, authenticated;
