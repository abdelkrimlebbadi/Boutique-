import "server-only";
import { createClient } from "@/lib/supabase/server";
import { convertCents } from "./convert";
import { psychologicalRoundCents } from "./psychological-round";
import { BASE_CURRENCY, type Currency } from "./constants";
import type { FxRates } from "./get-latest-rates";

export type DisplayPrice = {
  amountCents: number;
  currency: Currency;
  // false when a manual per-currency override row was used as-is (no
  // conversion/rounding applied — an admin already set that exact price).
  isConverted: boolean;
};

// Implements: "prix affiché = prix de base converti PUIS arrondi
// psychologiquement". The `prices` table may hold an explicit row for the
// target currency (a deliberate per-market override, used verbatim); when it
// doesn't, the USD reference row is converted with the current fx_rates and
// rounded to end in .99.
export async function getDisplayPrice(
  variantId: string,
  targetCurrency: Currency,
  rates: FxRates
): Promise<DisplayPrice | null> {
  const supabase = await createClient();

  const { data: override } = await supabase
    .from("prices")
    .select("amount_cents")
    .eq("variant_id", variantId)
    .eq("currency", targetCurrency)
    .maybeSingle();

  if (override) {
    return {
      amountCents: override.amount_cents,
      currency: targetCurrency,
      isConverted: false,
    };
  }

  const { data: basePrice } = await supabase
    .from("prices")
    .select("amount_cents")
    .eq("variant_id", variantId)
    .eq("currency", BASE_CURRENCY)
    .maybeSingle();

  if (!basePrice) return null;

  const rate = rates[targetCurrency];
  const converted =
    targetCurrency === BASE_CURRENCY
      ? basePrice.amount_cents
      : convertCents(basePrice.amount_cents, rate);

  return {
    amountCents: psychologicalRoundCents(converted),
    currency: targetCurrency,
    isConverted: targetCurrency !== BASE_CURRENCY,
  };
}
