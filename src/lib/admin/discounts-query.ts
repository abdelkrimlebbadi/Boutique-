import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/types/database.types";

export type DiscountCodeRow = Database["public"]["Tables"]["discount_codes"]["Row"];

export async function listDiscountCodes(): Promise<DiscountCodeRow[]> {
  const serviceRole = createServiceRoleClient();
  const { data } = await serviceRole
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getDiscountCode(id: string): Promise<DiscountCodeRow | null> {
  const serviceRole = createServiceRoleClient();
  const { data } = await serviceRole.from("discount_codes").select("*").eq("id", id).maybeSingle();
  return data;
}

export function discountCodeStatus(row: DiscountCodeRow): { label: string; negative: boolean } {
  if (!row.active) return { label: "inactif", negative: true };
  if (row.expires_at && new Date(row.expires_at) < new Date()) {
    return { label: "expiré", negative: true };
  }
  if (row.max_uses != null && row.used_count >= row.max_uses) {
    return { label: "épuisé", negative: true };
  }
  return { label: "actif", negative: false };
}
