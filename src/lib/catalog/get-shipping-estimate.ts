import "server-only";
import { lookupShippingRate } from "./lookup-shipping-rate";
import { getLatestFxRates } from "@/lib/currency/get-latest-rates";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import type { Currency } from "@/lib/currency/constants";

export type ShippingEstimate = {
  zoneName: string;
  priceCents: number;
  currency: Currency;
};

// Display-only estimate (PDP shipping widget): uses the visitor's cookie
// currency preference and degrades gracefully (shows the zone's own
// currency) if live rates aren't available, rather than blocking. For an
// authoritative, order-billing amount use get-shipping-quote.ts instead.
export async function getShippingEstimate(
  countryCode: string,
  weightGrams: number
): Promise<ShippingEstimate | null> {
  const rate = await lookupShippingRate(countryCode, weightGrams);
  if (!rate) return null;

  const displayCurrency = await getPreferredCurrency();
  if (rate.currency === displayCurrency) {
    return { zoneName: rate.zoneName, priceCents: rate.priceCents, currency: displayCurrency };
  }

  const rates = await getLatestFxRates();
  if (!rates) {
    // No live rates: show the estimate in the zone's own currency rather
    // than a wrong/unconverted number.
    return { zoneName: rate.zoneName, priceCents: rate.priceCents, currency: rate.currency };
  }

  const usdCents = rate.priceCents / rates[rate.currency];
  const convertedCents = Math.round(usdCents * rates[displayCurrency]);

  return { zoneName: rate.zoneName, priceCents: convertedCents, currency: displayCurrency };
}
