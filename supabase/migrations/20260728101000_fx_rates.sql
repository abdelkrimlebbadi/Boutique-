-- Daily exchange rate history, written exclusively by the GitHub Actions
-- cron (.github/workflows/fetch-fx-rates.yml) via the service_role key —
-- the front-end never calls an external FX API directly. Base currency is
-- always USD, matching products.base_cost_usd and the reference row each
-- variant's `prices` entry is expected to have in USD.

create table fx_rates (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null check (base_currency ~ '^[A-Z]{3}$'),
  quote_currency text not null check (quote_currency ~ '^[A-Z]{3}$'),
  rate numeric(18, 8) not null check (rate > 0),
  fetched_at timestamptz not null default now(),
  unique (base_currency, quote_currency, fetched_at)
);

create index fx_rates_lookup_idx on fx_rates (base_currency, quote_currency, fetched_at desc);

-- security_invoker so RLS on fx_rates (not the view owner's privileges)
-- governs who can read through this view — same public-read policy applies.
create view latest_fx_rates
  with (security_invoker = true)
as
select distinct on (base_currency, quote_currency)
  base_currency,
  quote_currency,
  rate,
  fetched_at
from fx_rates
order by base_currency, quote_currency, fetched_at desc;

-- ---------------------------------------------------------------------------
-- Row Level Security — exchange rates are not sensitive: public read, no
-- client writes (only service_role, from the daily cron, writes here).
-- ---------------------------------------------------------------------------

alter table fx_rates enable row level security;

create policy "public read fx rates"
  on fx_rates for select
  to anon, authenticated
  using (true);
