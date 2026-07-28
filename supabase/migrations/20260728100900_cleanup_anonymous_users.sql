-- Periodic cleanup of stale Supabase Anonymous Auth users: removes anonymous
-- auth.users rows inactive for more than 30 days that have no order and no
-- cart with items, so auth.users does not grow unbounded. Deleting the
-- auth.users row cascades to customers/addresses/carts via the FKs already
-- defined (on delete cascade), removing any empty leftover cart with it.

create function cleanup_stale_anonymous_users()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  delete from auth.users u
  where u.is_anonymous
    and coalesce(u.last_sign_in_at, u.created_at) < now() - interval '30 days'
    and not exists (
      select 1 from orders o where o.customer_id = u.id
    )
    and not exists (
      select 1 from carts c
      join cart_items ci on ci.cart_id = c.id
      where c.customer_id = u.id
    );
end;
$$;

-- pg_cron ships pre-enabled on every Supabase-hosted project (including the
-- free tier — see CLAUDE.md rule 1), but is not installed in the throwaway
-- local Postgres used to test migrations / generate TypeScript types. The
-- block below degrades gracefully there and actually schedules the job on a
-- real Supabase project.
do $$
begin
  create extension if not exists pg_cron;
exception
  when others then
    raise notice 'pg_cron unavailable in this environment (expected outside a hosted Supabase project): %', sqlerrm;
end;
$$;

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule(
      'cleanup-stale-anonymous-users',
      '0 3 * * *',
      $cron$select public.cleanup_stale_anonymous_users();$cron$
    );
  else
    raise notice 'pg_cron not installed — skipping schedule (it will self-schedule on a hosted Supabase project).';
  end if;
end;
$$;
