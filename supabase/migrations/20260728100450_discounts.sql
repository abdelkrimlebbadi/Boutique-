-- Discount codes. Created before orders because orders.discount_code_id
-- references this table.

create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type discount_type not null,
  amount_cents integer check (amount_cents is null or amount_cents >= 0),
  percentage numeric(5, 2) check (percentage is null or (percentage > 0 and percentage <= 100)),
  max_uses integer check (max_uses is null or max_uses > 0),
  used_count integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (type = 'fixed' and amount_cents is not null and percentage is null) or
    (type = 'percentage' and percentage is not null and amount_cents is null)
  ),
  check (max_uses is null or used_count <= max_uses)
);

create index discount_codes_active_idx on discount_codes (code) where active;

create trigger discount_codes_set_updated_at
  before update on discount_codes
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — no direct select policy: exposing the whole table
-- would leak every active promo code to anyone with the anon key. Codes are
-- validated one at a time through this SECURITY DEFINER function instead.
-- ---------------------------------------------------------------------------

alter table discount_codes enable row level security;

create function validate_discount_code(p_code text)
returns table (
  valid boolean,
  discount_code_id uuid,
  type discount_type,
  amount_cents integer,
  percentage numeric
)
language sql
security definer
set search_path = public
stable
as $$
  select
    true as valid,
    d.id as discount_code_id,
    d.type,
    d.amount_cents,
    d.percentage
  from discount_codes d
  where d.code = p_code
    and d.active
    and (d.expires_at is null or d.expires_at > now())
    and (d.max_uses is null or d.used_count < d.max_uses)
  union all
  select false, null, null, null, null
  where not exists (
    select 1 from discount_codes d
    where d.code = p_code
      and d.active
      and (d.expires_at is null or d.expires_at > now())
      and (d.max_uses is null or d.used_count < d.max_uses)
  );
$$;

grant execute on function validate_discount_code(text) to anon, authenticated;
