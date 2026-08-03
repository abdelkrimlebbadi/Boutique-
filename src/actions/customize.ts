"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { sniffImage, MAX_UPLOAD_BYTES } from "@/lib/uploads/sniff-image";

// Raw design upload, before any cart line exists yet — the customizer runs
// entirely on the PDP first (upload, position, add text), and only becomes
// a cart_items row once "Ajouter au panier" is clicked (see
// addToCart in src/actions/cart.ts). Every visitor already has at least an
// anonymous session by the time they reach a PDP (ensureSupabaseSession in
// middleware.ts), so requiring one here is free, not a new UX gate.
export async function uploadDesignImage(
  formData: FormData
): Promise<{ error: string } | { ok: true; url: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Session invalide." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Fichier manquant." };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Fichier trop volumineux (10 Mo max)." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  // Never trusts file.type or the filename extension — both are set by the
  // browser from client-controlled input. sniffImage reads the actual
  // magic bytes and parses real dimensions from the image header.
  const sniffed = sniffImage(bytes);
  if (!sniffed) return { error: "Fichier image invalide (JPG ou PNG requis)." };

  const extension = sniffed.format === "png" ? "png" : "jpg";
  const path = `raw/${crypto.randomUUID()}.${extension}`;

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole.storage
    .from("custom-designs")
    .upload(path, bytes, { contentType: sniffed.format === "png" ? "image/png" : "image/jpeg" });
  if (error) return { error: "Échec de l'upload." };

  const { data } = serviceRole.storage.from("custom-designs").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

const finalizeCartItemDesignSchema = z.object({
  cartItemId: z.string().uuid(),
});

// Uploads the flattened print-ready export produced by DesignCompositor
// (src/components/checkout/DesignCompositor.tsx) right before payment, and
// attaches it to the cart line. The storage write itself must go through
// service_role (custom-designs has no anon/authenticated write policy —
// same posture as product-images), but the cart_items UPDATE goes through
// the visitor's own RLS-scoped session: "manage own cart items" already
// requires cart_items.cart_id to belong to auth.uid(), so a cartItemId the
// caller doesn't own simply matches zero rows instead of needing a
// separate ownership check written by hand here.
export async function finalizeCartItemDesign(
  formData: FormData
): Promise<{ error: string } | { ok: true; url: string }> {
  const parsed = finalizeCartItemDesignSchema.safeParse({
    cartItemId: formData.get("cartItemId"),
  });
  if (!parsed.success) return { error: "Requête invalide." };
  const { cartItemId } = parsed.data;

  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Fichier manquant." };
  if (file.size > MAX_UPLOAD_BYTES) return { error: "Fichier trop volumineux." };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniffImage(bytes);
  if (!sniffed) return { error: "Échec de la génération du visuel d'impression." };

  const supabase = await createClient();
  const { data: owned } = await supabase
    .from("cart_items")
    .select("id")
    .eq("id", cartItemId)
    .maybeSingle();
  if (!owned) return { error: "Article de panier introuvable." };

  const extension = sniffed.format === "png" ? "png" : "jpg";
  const path = `final/${cartItemId}.${extension}`;

  const serviceRole = createServiceRoleClient();
  const { error: uploadError } = await serviceRole.storage
    .from("custom-designs")
    .upload(path, bytes, {
      contentType: sniffed.format === "png" ? "image/png" : "image/jpeg",
      upsert: true, // re-generating (e.g. the customer edited, went back, came forward again)
    });
  if (uploadError) return { error: "Échec de l'upload du visuel final." };

  const { data: publicUrlData } = serviceRole.storage.from("custom-designs").getPublicUrl(path);
  const url = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("cart_items")
    .update({ custom_design_print_file_url: url })
    .eq("id", cartItemId);
  if (updateError) return { error: "Échec de l'enregistrement du visuel." };

  return { ok: true, url };
}
