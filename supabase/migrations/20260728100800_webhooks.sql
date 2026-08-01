-- Inbound webhook events (PayPal, YouCan Pay, Printful) — kept for
-- idempotence: a given (provider, external_id) is processed at most once.

create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider webhook_provider not null,
  external_id text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, external_id)
);

-- ---------------------------------------------------------------------------
-- Row Level Security — enabled with zero policies for anon/authenticated:
-- only the service_role key (used by webhook route handlers) can read or
-- write this table, since service_role bypasses RLS entirely.
-- ---------------------------------------------------------------------------

alter table webhook_events enable row level security;
