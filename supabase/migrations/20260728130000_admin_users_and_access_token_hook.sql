-- Admin role via a Supabase Custom Access Token Auth Hook: admin_users is
-- the source of truth, the hook injects a `user_role` claim into every JWT
-- issued for a matching auth.users id. Middleware/Server Actions check
-- that claim rather than querying admin_users on every request.

create table admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- No policies for anon/authenticated: only service_role (application code)
-- and supabase_auth_admin (the hook, invoked by GoTrue itself) ever
-- read/write this table.
alter table admin_users enable row level security;

create function custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  is_admin boolean;
begin
  select exists (
    select 1 from public.admin_users where user_id = (event ->> 'user_id')::uuid
  ) into is_admin;

  claims := coalesce(event -> 'claims', '{}'::jsonb);
  claims := jsonb_set(claims, '{user_role}', to_jsonb(case when is_admin then 'admin' else 'customer' end));
  event := jsonb_set(event, '{claims}', claims);

  return event;
end;
$$;

-- Per Supabase's Auth Hooks contract: GoTrue calls this function as the
-- supabase_auth_admin role, not as the caller's own role, so explicit
-- grants are required regardless of the revoke below.
grant usage on schema public to supabase_auth_admin;
grant select on table admin_users to supabase_auth_admin;
grant execute on function custom_access_token_hook to supabase_auth_admin;
revoke execute on function custom_access_token_hook from public, anon, authenticated;

-- Operational note: registering this hook also requires either
-- supabase/config.toml's [auth.hook.custom_access_token] section to take
-- effect via a linked `supabase db push`/CLI deploy, or a manual toggle in
-- Supabase Dashboard -> Authentication -> Hooks pointing at this function.
-- Neither this migration nor config.toml alone guarantees GoTrue actually
-- invokes it — verify after deploying.
