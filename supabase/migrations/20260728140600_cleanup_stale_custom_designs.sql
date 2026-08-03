-- Periodic cleanup of orphaned customization uploads: removes cart_items
-- design columns (and their storage.objects) once the line is more than 30
-- days old and was never carried into an order_items row — i.e. never
-- attached to a real checkout attempt, paid or not. Same mechanism as
-- 20260728100900_cleanup_anonymous_users.sql: a pg_cron job, not a GitHub
-- Actions workflow (no such workflow exists for this kind of cleanup —
-- pg_cron ships pre-enabled on every Supabase-hosted project, including the
-- free tier, see CLAUDE.md rule 1).

create function cleanup_stale_custom_designs()
returns void
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  v_stale_ids uuid[];
begin
  select array_agg(id) into v_stale_ids
  from cart_items
  where custom_design_image_url is not null
    and created_at < now() - interval '30 days'
    and not exists (
      select 1 from order_items oi
      where oi.custom_design_url = cart_items.custom_design_print_file_url
    );

  if v_stale_ids is null then
    return;
  end if;

  delete from storage.objects
  where bucket_id = 'custom-designs'
    and name in (
      select regexp_replace(design_url, '^.*/custom-designs/', '')
      from cart_items, lateral unnest(
        array[custom_design_image_url, custom_design_print_file_url]
      ) as design_url
      where cart_items.id = any (v_stale_ids)
        and design_url is not null
    );

  delete from cart_items where id = any (v_stale_ids);
end;
$$;

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
      'cleanup-stale-custom-designs',
      '30 3 * * *',
      $cron$select public.cleanup_stale_custom_designs();$cron$
    );
  else
    raise notice 'pg_cron not installed — skipping schedule (it will self-schedule on a hosted Supabase project).';
  end if;
end;
$$;
