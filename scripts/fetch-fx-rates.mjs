// Runs once a day from .github/workflows/fetch-fx-rates.yml (never from the
// browser/front-end). Fetches USD-based exchange rates from a free, no-key
// API and writes them into the fx_rates table using the Supabase
// service_role key.
//
// Provider: @fawazahmed0/currency-api (community-maintained, free, no key,
// no rate limit, mirrors 150+ currencies including MAD — which the two
// providers suggested in the original spec do not reliably offer for free
// without a key: exchangerate.host now requires a signup/API key, and
// frankfurter.app only covers the ECB reference list, which excludes MAD).
// Two CDN hosts are tried for resilience against a single mirror being down.

import { createClient } from "@supabase/supabase-js";

const QUOTE_CURRENCIES = ["mad", "eur", "gbp", "usd"];
const BASE_CURRENCY = "USD";

const SOURCES = [
  "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
  "https://latest.currency-api.pages.dev/v1/currencies/usd.json",
];

async function fetchRates() {
  let lastError;
  for (const url of SOURCES) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${url} responded with ${response.status}`);
      }
      const body = await response.json();
      const usdRates = body.usd;
      if (!usdRates) throw new Error(`${url} response missing "usd" key`);
      return usdRates;
    } catch (error) {
      lastError = error;
      console.warn(`fetch-fx-rates: source failed (${url}):`, error.message);
    }
  }
  throw lastError ?? new Error("All FX rate sources failed");
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (GitHub Actions secrets)."
    );
  }

  const usdRates = await fetchRates();
  const fetchedAt = new Date().toISOString();

  const rows = QUOTE_CURRENCIES.map((quote) => {
    const rate = quote === "usd" ? 1 : usdRates[quote];
    if (typeof rate !== "number" || !(rate > 0)) {
      throw new Error(`Missing or invalid rate for ${quote.toUpperCase()}`);
    }
    return {
      base_currency: BASE_CURRENCY,
      quote_currency: quote.toUpperCase(),
      rate,
      fetched_at: fetchedAt,
    };
  });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await supabase.from("fx_rates").insert(rows);
  if (error) throw new Error(`Failed to insert fx_rates: ${error.message}`);

  console.log(`fetch-fx-rates: inserted ${rows.length} rates at ${fetchedAt}`);
  for (const row of rows) {
    console.log(`  1 ${row.base_currency} = ${row.rate} ${row.quote_currency}`);
  }
}

main().catch((error) => {
  console.error("fetch-fx-rates failed:", error);
  process.exit(1);
});
