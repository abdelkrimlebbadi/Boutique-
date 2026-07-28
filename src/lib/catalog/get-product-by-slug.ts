import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getLatestFxRates } from "@/lib/currency/get-latest-rates";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { getDisplayPrice } from "@/lib/currency/get-display-price";
import type { Locale } from "@/i18n/routing";
import type { Currency } from "@/lib/currency/constants";

export type ProductVariantView = {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  weightGrams: number | null;
  priceCents: number;
  currency: Currency;
};

export type ProductImageView = {
  url: string;
  alt: string | null;
  position: number;
};

export type ProductDetailView = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDesc: string | null;
  isBestseller: boolean;
  category: { slug: string; name: string } | null;
  images: ProductImageView[];
  variants: ProductVariantView[];
};

export async function getProductBySlug(
  slug: string,
  locale: Locale
): Promise<ProductDetailView | null> {
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(
      `id, slug, is_bestseller,
       product_translations!inner ( name, description, seo_title, seo_desc ),
       product_images ( url, alt, position ),
       product_variants ( id, sku, size, color, weight_grams ),
       product_categories (
         categories ( slug, category_translations ( name, locale ) )
       )`
    )
    .eq("slug", slug)
    .eq("status", "active")
    .eq("product_translations.locale", locale)
    .maybeSingle();

  if (!product) return null;

  const translation = product.product_translations[0];
  const firstCategoryLink = product.product_categories[0];
  const categoryTranslation = firstCategoryLink?.categories.category_translations.find(
    (t) => t.locale === locale
  );

  const [currency, rates] = await Promise.all([
    getPreferredCurrency(),
    getLatestFxRates(),
  ]);

  const variants: ProductVariantView[] = rates
    ? await Promise.all(
        product.product_variants.map(async (variant) => {
          const displayPrice = await getDisplayPrice(variant.id, currency, rates);
          return {
            id: variant.id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            weightGrams: variant.weight_grams,
            priceCents: displayPrice?.amountCents ?? 0,
            currency,
          };
        })
      )
    : product.product_variants.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        weightGrams: variant.weight_grams,
        priceCents: 0,
        currency,
      }));

  return {
    id: product.id,
    slug: product.slug,
    name: translation?.name ?? product.slug,
    description: translation?.description ?? null,
    seoTitle: translation?.seo_title ?? null,
    seoDesc: translation?.seo_desc ?? null,
    isBestseller: product.is_bestseller,
    category: firstCategoryLink
      ? {
          slug: firstCategoryLink.categories.slug,
          name: categoryTranslation?.name ?? firstCategoryLink.categories.slug,
        }
      : null,
    images: [...product.product_images].sort((a, b) => a.position - b.position),
    variants,
  };
}
