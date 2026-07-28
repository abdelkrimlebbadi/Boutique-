-- One-time first-admin bootstrap, guarded against a concurrent double
-- bootstrap with an advisory lock rather than a unique constraint (there's
-- nothing to be unique on besides "admin_users has any row at all").
-- Returns false (no-op) if an admin already exists by the time the lock is
-- acquired — the caller's freshly-created auth.users row is then an
-- orphan, recoverable manually; accepted as a rare, one-time-flow edge
-- case (see /admin/setup).

create function bootstrap_admin_if_empty(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext('admin_users_bootstrap'));

  if exists (select 1 from admin_users) then
    return false;
  end if;

  insert into admin_users (user_id) values (p_user_id);
  return true;
end;
$$;

revoke execute on function bootstrap_admin_if_empty from public, anon, authenticated;
