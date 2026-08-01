import "server-only";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { CART_ID_COOKIE_NAME } from "./constants";

type Client = SupabaseClient<Database>;

// Read-only resolution, never creates a cart: cookie fast path first (RLS
// silently returns nothing if the id doesn't belong to the current session,
// so trusting a hit is safe by construction), otherwise falls back to the
// customer_id lookup. Returns null if the visitor has no active cart yet.
export async function resolveActiveCartId(
  supabase: Client
): Promise<string | null> {
  const cookieStore = await cookies();
  const cachedId = cookieStore.get(CART_ID_COOKIE_NAME)?.value;

  if (cachedId) {
    const { data } = await supabase
      .from("carts")
      .select("id")
      .eq("id", cachedId)
      .eq("status", "active")
      .maybeSingle();
    if (data) return data.id;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("carts")
    .select("id")
    .eq("customer_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  return data?.id ?? null;
}
