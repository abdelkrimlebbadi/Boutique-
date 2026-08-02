-- admin_users has RLS enabled with no policies, which means custom_access_token_hook
-- (invoked by GoTrue as supabase_auth_admin, not as a superuser/table owner) always
-- sees zero rows regardless of the earlier `grant select ... to supabase_auth_admin`
-- in 20260728130000 — a GRANT alone does not bypass RLS. Without this policy the
-- hook silently assigns user_role: 'customer' to every JWT, admin included.
create policy "supabase_auth_admin can read admin_users"
on admin_users
for select
to supabase_auth_admin
using (true);
