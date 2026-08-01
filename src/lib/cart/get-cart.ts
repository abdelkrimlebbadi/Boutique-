import "server-only";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveCartId } from "./resolve-cart-id";
import { getLatestFxRates } from "@/lib/currency/get-latest-rates";
import { getDisplayPrice } from "@/lib/currency/get-display-price";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { EMPTY_CART, type CartItemView, type CartView } from "./types";
import type { Locale } from "@/i18n/routing";

// Cart display must never take the whole app down with it (e.g. layout.tsx
// renders it on every page): any Supabase failure degrades to an empty
// cart rather than throwing, same posture as getLatestFxRates.
export async function getCart(locale: Locale): Promise<CartView> {
  const currency = await getPreferredCurrency();
  try {
    return await loadCart(locale, currency);
  } catch (error) {
    console.error("getCart failed:", error);
    return EMPTY_CART(currency);
  }
}

async function loadCart(
  locale: Locale,
  currency: CartView["currency"]
): Promise<CartView> {
  const supabase = await createClient();
  const cartId = await resolveActiveCartId(supabase);

  if (!cartId) return EMPTY_CART(currency);

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("id, variant_id, quantity")
    .eq("cart_id", cartId);

  if (!cartItems || cartItems.length === 0) return EMPTY_CART(currency);

  const variantIds = cartItems.map((item) => item.variant_id);

  const [{ data: variants }, rates] = await Promise.all([
    supabase
      .from("product_variants")
      .select(
        `id, sku, size, color,
         products!inner (
           slug,
           product_translations!inner ( name ),
           product_images ( url, alt, position )
         )`
      )
      .in("id", variantIds)
      .eq("products.product_translations.locale", locale),
    getLatestFxRates(),
  ]);

  if (!variants) return EMPTY_CART(currency);

  const variantById = new Map(variants.map((variant) => [variant.id, variant]));

  const items: CartItemView[] = [];
  let subtotalCents = 0;

  for (const cartItem of cartItems) {
    const variant = variantById.get(cartItem.variant_id);
    if (!variant) continue;

    const product = variant.products;
    const name = product.product_translations[0]?.name ?? variant.sku;
    const image = [...product.product_images].sort(
      (a, b) => a.position - b.position
    )[0];

    const displayPrice = rates
      ? await getDisplayPrice(cartItem.variant_id, currency, rates)
      : null;
    const unitPriceCents = displayPrice?.amountCents ?? 0;
    const lineTotalCents = unitPriceCents * cartItem.quantity;
    subtotalCents += lineTotalCents;

    items.push({
      id: cartItem.id,
      variantId: cartItem.variant_id,
      quantity: cartItem.quantity,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      productSlug: product.slug,
      productName: name,
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt ?? null,
      unitPriceCents,
      lineTotalCents,
    });
  }

  return {
    id: cartId,
    currency,
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalCents,
  };
}
