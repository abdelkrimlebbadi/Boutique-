-- Customers (1:1 with auth.users — includes both real accounts and Supabase
-- Anonymous Auth sessions, see 20260728100900_cleanup_anonymous_users.sql)
-- and their address book.

create table customers (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  preferred_locale text not null default 'fr',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger customers_set_updated_at
  before update on customers
  for each row
  execute function set_updated_at();

-- Every new auth.users row (real sign-up or anonymous session) gets a
-- matching customers row automatically — clients can never insert into
-- customers directly because of the FK to auth.users.
create function handle_new_customer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customers (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_customer();

create table addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers (id) on delete cascade,
  full_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  state text,
  postal_code text not null,
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  phone text,
  is_default_shipping boolean not null default false,
  is_default_billing boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_customer_id_idx on addresses (customer_id);

create trigger addresses_set_updated_at
  before update on addresses
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security — a customer only ever sees and manages their own row.
-- ---------------------------------------------------------------------------

alter table customers enable row level security;
alter table addresses enable row level security;

create policy "read own customer row"
  on customers for select
  to authenticated
  using (id = auth.uid());

create policy "update own customer row"
  on customers for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No insert/delete policy for customers: the row is created by the
-- on_auth_user_created trigger and removed via auth.users cascade only.

create policy "manage own addresses"
  on addresses for all
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());
