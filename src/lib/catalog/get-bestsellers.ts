import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getLatestFxRates } from "@/lib/currency/get-latest-rates";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { toProductCardView } from "./to-product-card-view";
import type { Locale } from "@/i18n/routing";
import type { ProductCardView } from "./types";

export async function getBestsellers(
  locale: Locale,
  limit = 4
): Promise<ProductCardView[]> {
  const supabase = await createClient();
  const [currency, rates] = await Promise.all([
    getPreferredCurrency(),
    getLatestFxRates(),
  ]);
  const rate = rates?.[currency] ?? 1;

  const { data } = await supabase
    .from("product_catalog")
    .select(
      "product_id, slug, name, image_url, image_alt, colors, sizes, min_price_usd_cents, is_bestseller"
    )
    .eq("locale", locale)
    .eq("is_bestseller", true)
    .limit(limit);

  if (!data) return [];

  return data
    .map((row) => toProductCardView(row, currency, rate))
    .filter((card): card is ProductCardView => card !== null);
}
