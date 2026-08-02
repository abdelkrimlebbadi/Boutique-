"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveCartId } from "@/lib/cart/resolve-cart-id";
import { CART_ID_COOKIE_NAME } from "@/lib/cart/constants";

const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

async function getOrCreateActiveCartId(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const existingId = await resolveActiveCartId(supabase);
  if (existingId) return existingId;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No Supabase session — cannot create a cart.");

  const { data, error } = await supabase
    .from("carts")
    .insert({ customer_id: user.id })
    .select("id")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Failed to create cart");

  const cookieStore = await cookies();
  cookieStore.set(CART_ID_COOKIE_NAME, data.id, {
    maxAge: CART_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
  });

  return data.id;
}

const addToCartSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

// Temporary: returns the underlying failure instead of throwing, so the
// real message reaches the browser — Next.js replaces thrown Server Action
// errors with an opaque digest in production, which makes a live cart
// failure undiagnosable. Revert to throwing once resolved.
export async function addToCart(input: {
  variantId: string;
  quantity: number;
}): Promise<{ error: string } | void> {
  try {
    const { variantId, quantity } = addToCartSchema.parse(input);
    const supabase = await createClient();
    const cartId = await getOrCreateActiveCartId(supabase);

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("variant_id", variantId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existing.quantity + quantity })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({ cart_id: cartId, variant_id: variantId, quantity });
      if (error) throw new Error(error.message);
    }
  } catch (caughtError) {
    const message =
      caughtError instanceof Error ? caughtError.message : String(caughtError);
    console.error("addToCart failed:", caughtError);
    return { error: message };
  }

  revalidatePath("/", "layout");
}

const updateQuantitySchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});

export async function updateCartItemQuantity(input: {
  itemId: string;
  quantity: number;
}) {
  const { itemId, quantity } = updateQuantitySchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}

const removeItemSchema = z.object({
  itemId: z.string().uuid(),
});

export async function removeCartItem(input: { itemId: string }) {
  const { itemId } = removeItemSchema.parse(input);
  const supabase = await createClient();

  const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
