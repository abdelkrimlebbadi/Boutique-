-- Shipping zones (by country) and rates (by weight bracket).

create table shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_codes text[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shipping_zones_country_codes_idx on shipping_zones using gin (country_codes);

create trigger shipping_zones_set_updated_at
  before update on shipping_zones
  for each row
  execute function set_updated_at();

create table shipping_rates (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references shipping_zones (id) on delete cascade,
  min_weight_grams integer not null default 0 check (min_weight_grams >= 0),
  max_weight_grams integer check (max_weight_grams is null or max_weight_grams >= min_weight_grams),
  price_cents integer not null check (price_cents >= 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shipping_rates_zone_id_idx on shipping_rates (zone_id);

create trigger shipping_rates_set_updated_at
  before update on shipping_rates
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — public read (needed to estimate shipping cost before
-- login/checkout), no client writes.
-- ---------------------------------------------------------------------------

alter table shipping_zones enable row level security;
alter table shipping_rates enable row level security;

create policy "public read shipping zones"
  on shipping_zones for select
  to anon, authenticated
  using (true);

create policy "public read shipping rates"
  on shipping_rates for select
  to anon, authenticated
  using (true);
