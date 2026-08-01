import "server-only";
import { createClient } from "@/lib/supabase/server";
import { BASE_CURRENCY, CURRENCIES, type Currency } from "./constants";

export type FxRates = Record<Currency, number>;

// Reads the latest daily rate per currency from the `latest_fx_rates` view
// (populated by the GitHub Actions cron, never fetched client-side). Returns
// null if the rates aren't available yet (e.g. no Supabase project linked,
// or the cron hasn't run) so callers can fall back gracefully instead of
// crashing.
export async function getLatestFxRates(): Promise<FxRates | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("latest_fx_rates")
      .select("quote_currency, rate")
      .eq("base_currency", BASE_CURRENCY);

    if (error || !data) return null;

    const rates = { [BASE_CURRENCY]: 1 } as FxRates;
    for (const row of data) {
      if (
        row.quote_currency &&
        row.rate !== null &&
        (CURRENCIES as readonly string[]).includes(row.quote_currency)
      ) {
        rates[row.quote_currency as Currency] = Number(row.rate);
      }
    }

    const hasAllCurrencies = CURRENCIES.every((currency) => currency in rates);
    return hasAllCurrencies ? rates : null;
  } catch {
    return null;
  }
}
