import "server-only";
import { lookupShippingRate } from "./lookup-shipping-rate";
import { getLatestFxRates } from "@/lib/currency/get-latest-rates";
import type { Currency } from "@/lib/currency/constants";

export type ShippingQuote = {
  zoneName: string;
  priceCents: number;
};

// Authoritative shipping cost for billing, in an explicit target currency
// (the order's frozen currency, never the visitor's live cookie
// preference — those can diverge between checkout and a later webhook).
// Unlike get-shipping-estimate.ts, this never silently degrades: if a
// live rate isn't available to convert, it returns null and the caller
// must block checkout rather than charge a wrong amount.
export async function getShippingQuote(
  countryCode: string,
  weightGrams: number,
  currency: Currency
): Promise<ShippingQuote | null> {
  const rate = await lookupShippingRate(countryCode, weightGrams);
  if (!rate) return null;

  if (rate.currency === currency) {
    return { zoneName: rate.zoneName, priceCents: rate.priceCents };
  }

  const rates = await getLatestFxRates();
  if (!rates) return null;

  const usdCents = rate.priceCents / rates[rate.currency];
  const convertedCents = Math.round(usdCents * rates[currency]);

  return { zoneName: rate.zoneName, priceCents: convertedCents };
}
