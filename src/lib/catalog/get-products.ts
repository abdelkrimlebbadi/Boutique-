import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getLatestFxRates } from "@/lib/currency/get-latest-rates";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { toProductCardView } from "./to-product-card-view";
import { encodeCursor, decodeCursor } from "./cursor";
import type { Locale } from "@/i18n/routing";
import type {
  ProductCardView,
  ProductFilters,
  ProductListResult,
  SortOption,
} from "./types";

const PAGE_SIZE = 24;

// Filters/sort/pagination all operate on the USD reference price
// (product_catalog.min_price_usd_cents), not the display-currency price:
// converting by a positive FX rate is a monotonic transform, so ordering
// by the USD price gives the identical result as ordering by the converted
// price, while keeping the query on a stable, indexable column regardless
// of which currency the visitor has selected.
export async function getProducts({
  locale,
  filters,
  sort = "newest",
  cursor,
}: {
  locale: Locale;
  filters: ProductFilters;
  sort?: SortOption;
  cursor?: string;
}): Promise<ProductListResult> {
  const supabase = await createClient();
  const [currency, rates] = await Promise.all([
    getPreferredCurrency(),
    getLatestFxRates(),
  ]);
  const rate = rates?.[currency] ?? 1;

  let query = supabase
    .from("product_catalog")
    .select(
      "product_id, slug, name, image_url, image_alt, colors, sizes, min_price_usd_cents, is_bestseller, created_at"
    )
    .eq("locale", locale);

  if (filters.category) {
    query = query.contains("category_slugs", [filters.category]);
  }
  if (filters.color) {
    query = query.contains("colors", [filters.color]);
  }
  if (filters.size) {
    query = query.contains("sizes", [filters.size]);
  }
  if (filters.minPriceCents != null) {
    query = query.gte(
      "min_price_usd_cents",
      Math.floor(filters.minPriceCents / rate)
    );
  }
  if (filters.maxPriceCents != null) {
    query = query.lte(
      "min_price_usd_cents",
      Math.ceil(filters.maxPriceCents / rate)
    );
  }

  const sortColumn = sort === "newest" ? "created_at" : "min_price_usd_cents";
  const ascending = sort === "price_asc";

  query = query
    .order(sortColumn, { ascending })
    .order("product_id", { ascending: true });

  const decoded = cursor ? decodeCursor(cursor) : null;
  if (decoded) {
    const operator = ascending ? "gt" : "lt";
    // Secondary tiebreaker (product_id) is always ordered ascending above,
    // independent of the primary sort direction, so its cursor condition
    // always uses `gt`.
    query = query.or(
      `${sortColumn}.${operator}.${decoded.v},and(${sortColumn}.eq.${decoded.v},product_id.gt.${decoded.id})`
    );
  }

  query = query.limit(PAGE_SIZE + 1);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data) return { items: [], nextCursor: null };

  const hasNextPage = data.length > PAGE_SIZE;
  const rows = hasNextPage ? data.slice(0, PAGE_SIZE) : data;

  const items: ProductCardView[] = rows
    .map((row) => toProductCardView(row, currency, rate))
    .filter((card): card is ProductCardView => card !== null);

  let nextCursor: string | null = null;
  if (hasNextPage) {
    const last = rows[rows.length - 1];
    const sortValue = sort === "newest" ? last.created_at : last.min_price_usd_cents;
    if (sortValue != null && last.product_id) {
      nextCursor = encodeCursor({ v: sortValue, id: last.product_id });
    }
  }

  return { items, nextCursor };
}
