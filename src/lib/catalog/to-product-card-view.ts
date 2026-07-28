import { convertCents } from "@/lib/currency/convert";
import { psychologicalRoundCents } from "@/lib/currency/psychological-round";
import { BASE_CURRENCY, type Currency } from "@/lib/currency/constants";
import type { ProductCardView } from "./types";

// product_catalog is a view, so postgres-meta types every column as
// nullable even though the underlying products/product_translations
// columns (id, slug, name) are NOT NULL — rows missing them are dropped
// defensively rather than asserted away.
export type ProductCatalogRow = {
  product_id: string | null;
  slug: string | null;
  name: string | null;
  image_url: string | null;
  image_alt: string | null;
  colors: string[] | null;
  sizes: string[] | null;
  min_price_usd_cents: number | null;
  is_bestseller: boolean | null;
};

export function toProductCardView(
  row: ProductCatalogRow,
  currency: Currency,
  rate: number
): ProductCardView | null {
  if (!row.product_id || !row.slug || !row.name) return null;

  const usdCents = row.min_price_usd_cents ?? 0;
  const converted =
    currency === BASE_CURRENCY ? usdCents : convertCents(usdCents, rate);

  return {
    id: row.product_id,
    slug: row.slug,
    name: row.name,
    imageUrl: row.image_url,
    imageAlt: row.image_alt,
    colors: row.colors ?? [],
    sizes: row.sizes ?? [],
    priceCents: psychologicalRoundCents(converted),
    currency,
    isBestseller: row.is_bestseller ?? false,
  };
}
