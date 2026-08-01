import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

function toKebabCase(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Appends -2/-3/... on collision. Only used by the Printful import flow
// (the manual ProductForm lets the admin type/edit the slug directly).
export async function generateUniqueSlug(name: string): Promise<string> {
  const serviceRole = createServiceRoleClient();
  const base = toKebabCase(name) || "produit";

  let candidate = base;
  let suffix = 2;
  for (;;) {
    const { data } = await serviceRole
      .from("products")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}
