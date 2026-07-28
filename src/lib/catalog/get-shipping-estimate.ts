import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getLatestFxRates } from "@/lib/currency/get-latest-rates";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import type { Currency } from "@/lib/currency/constants";

export type ShippingEstimate = {
  zoneName: string;
  priceCents: number;
  currency: Currency;
};

export async function getShippingEstimate(
  countryCode: string,
  weightGrams: number
): Promise<ShippingEstimate | null> {
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

  const displayCurrency = await getPreferredCurrency();
  const zoneCurrency = rate.currency as Currency;

  if (zoneCurrency === displayCurrency) {
    return {
      zoneName: zone.name,
      priceCents: rate.price_cents,
      currency: displayCurrency,
    };
  }

  const rates = await getLatestFxRates();
  if (!rates) {
    // No live rates: show the estimate in the zone's own currency rather
    // than a wrong/unconverted number.
    return { zoneName: zone.name, priceCents: rate.price_cents, currency: zoneCurrency };
  }

  const usdCents = rate.price_cents / rates[zoneCurrency];
  const convertedCents = Math.round(usdCents * rates[displayCurrency]);

  return { zoneName: zone.name, priceCents: convertedCents, currency: displayCurrency };
}
