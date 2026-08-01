import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Privileged client for the small set of operations RLS deliberately
// forbids to anon/authenticated: creating an order, claiming a webhook
// event, and other service-role-only RPCs. No cookies/session involved —
// this is a static API key, never exposed to the browser. Only import this
// from Server Actions and route handlers that genuinely need to bypass RLS
// (checkout, webhooks) — everything else should use
// `@/lib/supabase/server`'s RLS-scoped client.
export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
