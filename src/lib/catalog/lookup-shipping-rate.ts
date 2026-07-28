import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Currency } from "@/lib/currency/constants";

export type ShippingRateLookup = {
  zoneName: string;
  priceCents: number;
  currency: Currency;
};

// Shared by get-shipping-estimate.ts (cookie-preferred currency, degrades
// gracefully for display) and get-shipping-quote.ts (explicit currency,
// never degrades — used to bill an order).
export async function lookupShippingRate(
  countryCode: string,
  weightGrams: number
): Promise<ShippingRateLookup | null> {
  const supabase = await createClient();

  const { data: zone } = await supabase
    .from("shipping_zones")
    .select("id, name")
    .contains("country_codes", [countryCode.toUpperCase()])
    .maybeSingle();
  if (!zone) return null;

  const { data: rate } = await supabase
    .from("shipping_rates")
    .select("price_cents, currency, min_weight_grams")
    .eq("zone_id", zone.id)
    .lte("min_weight_grams", weightGrams)
    .or(`max_weight_grams.is.null,max_weight_grams.gte.${weightGrams}`)
    .order("min_weight_grams", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!rate) return null;

  return {
    zoneName: zone.name,
    priceCents: rate.price_cents,
    currency: rate.currency as Currency,
  };
}
