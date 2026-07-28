import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getLatestFxRates } from "@/lib/currency/get-latest-rates";
import { getDisplayPrice } from "@/lib/currency/get-display-price";
import { getShippingQuote } from "@/lib/catalog/get-shipping-quote";
import type { Currency } from "@/lib/currency/constants";
import type { Locale } from "@/i18n/routing";

// Printful requires a package weight per line; most catalog items have one
// (product_variants.weight_grams), but the column is nullable — this
// stands in for anything missed at catalog entry rather than blocking
// checkout on incomplete catalog data.
const DEFAULT_ITEM_WEIGHT_GRAMS = 200;

export type OrderPricingItem = {
  variantId: string;
  productId: string | null;
  printfulVariantId: string | null;
  sku: string;
  name: string;
  variantLabel: string | null;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type OrderPricing = {
  items: OrderPricingItem[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  discountCents: number;
  discountCodeId: string | null;
  totalCents: number;
};

export type OrderPricingError =
  | "EMPTY_CART"
  | "MISSING_PRICE"
  | "NO_SHIPPING_RATE"
  | "INVALID_DISCOUNT_CODE";

export type OrderPricingResult =
  | { ok: true; pricing: OrderPricing }
  | { ok: false; error: OrderPricingError };

// The single, authoritative source of truth for what an order costs.
// Called both to display the running total in the tunnel and, recalculated
// from scratch with no caching between the two, by startPayment right
// before creating the order — nothing here ever trusts a client-supplied
// amount.
export async function computeOrderPricing(params: {
  cartItems: { variantId: string; quantity: number }[];
  currency: Currency;
  countryCode: string;
  locale: Locale;
  discountCode: string | null;
}): Promise<OrderPricingResult> {
  if (params.cartItems.length === 0) return { ok: false, error: "EMPTY_CART" };

  const supabase = await createClient();
  const variantIds = params.cartItems.map((item) => item.variantId);

  const [{ data: variants }, rates] = await Promise.all([
    supabase
      .from("product_variants")
      .select(
        `id, product_id, sku, size, color, weight_grams, printful_variant_id,
         products!inner (
           product_translations!inner ( name ),
           product_images ( url, alt, position )
         )`
      )
      .in("id", variantIds)
      .eq("products.product_translations.locale", params.locale),
    getLatestFxRates(),
  ]);

  if (!variants || !rates) return { ok: false, error: "MISSING_PRICE" };
  const variantById = new Map(variants.map((variant) => [variant.id, variant]));

  const items: OrderPricingItem[] = [];
  let subtotalCents = 0;
  let totalWeightGrams = 0;

  for (const cartItem of params.cartItems) {
    const variant = variantById.get(cartItem.variantId);
    if (!variant) return { ok: false, error: "MISSING_PRICE" };

    const displayPrice = await getDisplayPrice(cartItem.variantId, params.currency, rates);
    if (!displayPrice) return { ok: false, error: "MISSING_PRICE" };

    const product = variant.products;
    const name = product.product_translations[0]?.name ?? variant.sku;
    const image = [...product.product_images].sort((a, b) => a.position - b.position)[0];
    const variantLabel = [variant.color, variant.size].filter(Boolean).join(" / ") || null;

    const lineTotalCents = displayPrice.amountCents * cartItem.quantity;
    subtotalCents += lineTotalCents;

    const weight = variant.weight_grams;
    if (weight == null) {
      console.error(
        `computeOrderPricing: variant ${variant.id} has no weight_grams, using default`
      );
    }
    totalWeightGrams += (weight ?? DEFAULT_ITEM_WEIGHT_GRAMS) * cartItem.quantity;

    items.push({
      variantId: variant.id,
      productId: variant.product_id,
      printfulVariantId: variant.printful_variant_id,
      sku: variant.sku,
      name,
      variantLabel,
      imageUrl: image?.url ?? null,
      unitPriceCents: displayPrice.amountCents,
      quantity: cartItem.quantity,
      lineTotalCents,
    });
  }

  const shippingQuote = await getShippingQuote(
    params.countryCode,
    totalWeightGrams,
    params.currency
  );
  if (!shippingQuote) return { ok: false, error: "NO_SHIPPING_RATE" };

  let discountCents = 0;
  let discountCodeId: string | null = null;
  if (params.discountCode) {
    const { data: validation } = await supabase
      .rpc("validate_discount_code", { p_code: params.discountCode })
      .maybeSingle();
    if (!validation?.valid) return { ok: false, error: "INVALID_DISCOUNT_CODE" };

    discountCodeId = validation.discount_code_id;
    discountCents =
      validation.type === "fixed"
        ? Math.min(validation.amount_cents ?? 0, subtotalCents)
        : Math.round((subtotalCents * Number(validation.percentage ?? 0)) / 100);
  }

  const taxCents = 0;
  const totalCents = subtotalCents + shippingQuote.priceCents + taxCents - discountCents;

  return {
    ok: true,
    pricing: {
      items,
      subtotalCents,
      shippingCents: shippingQuote.priceCents,
      taxCents,
      discountCents,
      discountCodeId,
      totalCents,
    },
  };
}
