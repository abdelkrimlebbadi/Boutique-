import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getLatestFxRates } from "@/lib/currency/get-latest-rates";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { toProductCardView } from "./to-product-card-view";
import type { Locale } from "@/i18n/routing";
import type { ProductCardView } from "./types";

const TS_CONFIG_BY_LOCALE: Record<Locale, string> = {
  fr: "french",
  en: "english",
  es: "spanish",
  ar: "simple",
};

const SEARCH_LIMIT = 24;

export async function searchProducts(
  query: string,
  locale: Locale
): Promise<ProductCardView[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const supabase = await createClient();

  // Matching product ids via full-text search on the generated tsvector
  // column, restricted to the active catalog.
  const { data: matches } = await supabase
    .from("product_translations")
    .select("product_id, products!inner(status)")
    .eq("locale", locale)
    .eq("products.status", "active")
    .textSearch("search_vector", trimmed, {
      type: "websearch",
      config: TS_CONFIG_BY_LOCALE[locale],
    })
    .limit(SEARCH_LIMIT);

  if (!matches || matches.length === 0) return [];

  const orderedIds = matches.map((match) => match.product_id);

  const [currency, rates] = await Promise.all([
    getPreferredCurrency(),
    getLatestFxRates(),
  ]);
  const rate = rates?.[currency] ?? 1;

  const { data: cards } = await supabase
    .from("product_catalog")
    .select(
      "product_id, slug, name, image_url, image_alt, colors, sizes, min_price_usd_cents, is_bestseller"
    )
    .eq("locale", locale)
    .in("product_id", orderedIds);

  if (!cards) return [];

  const cardById = new Map(cards.map((card) => [card.product_id, card]));

  return orderedIds
    .map((id) => cardById.get(id))
    .filter((row): row is NonNullable<typeof row> => row != null)
    .map((row) => toProductCardView(row, currency, rate))
    .filter((card): card is ProductCardView => card !== null);
}
