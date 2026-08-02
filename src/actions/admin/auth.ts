"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { redirect, unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

function timingSafeEqualString(a: string, b: string): boolean {
  const hashA = createHash("sha256").update(a).digest();
  const hashB = createHash("sha256").update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function adminLogin(
  rawInput: z.input<typeof loginSchema>
): Promise<{ error: string } | void> {
  const { email, password } = loginSchema.parse(rawInput);
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  // Temporarily surfacing the raw Supabase error message (instead of the
  // generic "Identifiants invalides.") to diagnose a live login failure —
  // revert to the generic message once resolved, this leaks provider-level
  // detail an attacker could use to enumerate accounts.
  if (error) return { error: `Identifiants invalides (${error.message}).` };

  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const bootstrapSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
  secret: z.string().min(1),
});

// One-time first-admin creation, gated by ADMIN_BOOTSTRAP_SECRET and by
// bootstrap_admin_if_empty's advisory-lock guard (only the very first
// caller after admin_users is empty succeeds). No broader staff-management
// flow exists — additional admins are out of scope for now.
export async function bootstrapFirstAdmin(
  rawInput: z.input<typeof bootstrapSchema>
): Promise<{ error: string } | void> {
  const { email, password, secret } = bootstrapSchema.parse(rawInput);

  const expectedSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
  if (!expectedSecret || !timingSafeEqualString(secret, expectedSecret)) {
    return { error: "Configuration invalide." };
  }

  try {
    const serviceRole = createServiceRoleClient();

    const { count } = await serviceRole
      .from("admin_users")
      .select("id", { count: "exact", head: true });
    if (count && count > 0) {
      return { error: "Un compte administrateur existe déjà." };
    }

    const { data: created, error: createUserError } = await serviceRole.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createUserError || !created.user) {
      return { error: createUserError?.message ?? "Impossible de créer le compte." };
    }

    const { data: bootstrapped, error: bootstrapError } = await serviceRole.rpc(
      "bootstrap_admin_if_empty",
      { p_user_id: created.user.id }
    );
    if (bootstrapError || !bootstrapped) {
      return {
        error:
          "Un autre compte administrateur a été créé entre-temps. Connectez-vous avec ce compte.",
      };
    }
  } catch (caughtError) {
    // A thrown (not returned) error here means something unexpected broke
    // the request itself (network/runtime failure) rather than a normal
    // Supabase API rejection — surface it verbatim instead of a generic
    // message so a misconfiguration is diagnosable from the rendered page.
    unstable_rethrow(caughtError);
    const message = caughtError instanceof Error ? caughtError.message : String(caughtError);
    return { error: `Erreur technique : ${message}` };
  }

  redirect("/admin/login");
}
