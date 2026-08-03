import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { locales, type Locale } from "@/i18n/routing";
import type { Currency } from "@/lib/currency/constants";
import type { Database } from "@/types/database.types";

type ProductStatus = Database["public"]["Enums"]["product_status"];
type StockPolicy = Database["public"]["Enums"]["stock_policy"];

export type ProductListItem = {
  id: string;
  slug: string;
  status: ProductStatus;
  name: string;
  imageUrl: string | null;
};

// The admin is French-only — list view always shows the fr translation,
// falling back to the slug if it's somehow missing (e.g. mid-import).
export async function listProducts(filters: {
  status?: ProductStatus;
  q?: string;
}): Promise<ProductListItem[]> {
  const serviceRole = createServiceRoleClient();

  let query = serviceRole
    .from("products")
    .select(
      `id, slug, status,
       product_translations!inner ( name ),
       product_images ( url, position )`
    )
    .eq("product_translations.locale", "fr")
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.q) {
    const term = filters.q.replace(/[%,*]/g, "").trim();
    if (term) query = query.or(`slug.ilike.%${term}%`);
  }

  const { data } = await query;

  return (data ?? []).map((row) => {
    const image = [...row.product_images].sort((a, b) => a.position - b.position)[0];
    return {
      id: row.id,
      slug: row.slug,
      status: row.status,
      name: row.product_translations[0]?.name ?? row.slug,
      imageUrl: image?.url ?? null,
    };
  });
}

export type ProductEditData = {
  id: string | null;
  slug: string;
  status: ProductStatus;
  baseCostUsd: number;
  printfulVariantId: string | null;
  isBestseller: boolean;
  translations: {
    locale: Locale;
    name: string;
    description: string | null;
    seoTitle: string | null;
    seoDesc: string | null;
  }[];
  variants: {
    id: string | null;
    sku: string;
    size: string | null;
    color: string | null;
    printfulVariantId: string | null;
    stockPolicy: StockPolicy;
    weightGrams: number | null;
    printAreaWidthPx: number | null;
    printAreaHeightPx: number | null;
    printAreaDpi: number | null;
    prices: { currency: Currency; amountCents: number; compareAtCents: number | null }[];
  }[];
  categoryIds: string[];
  images: { url: string; alt: string | null; position: number }[];
};

export function emptyProductEditData(): ProductEditData {
  return {
    id: null,
    slug: "",
    status: "draft",
    baseCostUsd: 0,
    printfulVariantId: null,
    isBestseller: false,
    translations: locales.map((locale) => ({
      locale,
      name: "",
      description: null,
      seoTitle: null,
      seoDesc: null,
    })),
    variants: [],
    categoryIds: [],
    images: [],
  };
}

export async function getProductForEdit(productId: string): Promise<ProductEditData | null> {
  const serviceRole = createServiceRoleClient();

  const [{ data: product }, { data: translations }, { data: variants }, { data: images }, { data: categoryLinks }] =
    await Promise.all([
      serviceRole.from("products").select("*").eq("id", productId).maybeSingle(),
      serviceRole.from("product_translations").select("*").eq("product_id", productId),
      serviceRole
        .from("product_variants")
        .select("*, prices (currency, amount_cents, compare_at_cents)")
        .eq("product_id", productId),
      serviceRole
        .from("product_images")
        .select("url, alt, position")
        .eq("product_id", productId)
        .order("position", { ascending: true }),
      serviceRole.from("product_categories").select("category_id").eq("product_id", productId),
    ]);

  if (!product) return null;

  const translationsByLocale = new Map((translations ?? []).map((t) => [t.locale, t]));

  return {
    id: product.id,
    slug: product.slug,
    status: product.status,
    baseCostUsd: product.base_cost_usd,
    printfulVariantId: product.printful_variant_id,
    isBestseller: product.is_bestseller,
    translations: locales.map((locale) => {
      const existing = translationsByLocale.get(locale);
      return {
        locale,
        name: existing?.name ?? "",
        description: existing?.description ?? null,
        seoTitle: existing?.seo_title ?? null,
        seoDesc: existing?.seo_desc ?? null,
      };
    }),
    variants: (variants ?? []).map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      printfulVariantId: variant.printful_variant_id,
      stockPolicy: variant.stock_policy,
      weightGrams: variant.weight_grams,
      printAreaWidthPx: variant.print_area_width_px,
      printAreaHeightPx: variant.print_area_height_px,
      printAreaDpi: variant.print_area_dpi,
      prices: (variant.prices ?? []).map((price) => ({
        currency: price.currency as Currency,
        amountCents: price.amount_cents,
        compareAtCents: price.compare_at_cents,
      })),
    })),
    categoryIds: (categoryLinks ?? []).map((link) => link.category_id),
    images: images ?? [],
  };
}

export type CategoryOption = { id: string; name: string };

export async function listCategoryOptions(): Promise<CategoryOption[]> {
  const serviceRole = createServiceRoleClient();
  const { data } = await serviceRole
    .from("categories")
    .select("id, category_translations!inner ( name )")
    .eq("category_translations.locale", "fr")
    .order("position", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.category_translations[0]?.name ?? row.id,
  }));
}
