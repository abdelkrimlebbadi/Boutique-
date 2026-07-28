import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts } from "@/lib/catalog/get-products";
import { getCategories } from "@/lib/catalog/get-categories";
import { FiltersSidebar } from "@/components/catalog/FiltersSidebar";
import { SortSelect } from "@/components/catalog/SortSelect";
import { ProductCard } from "@/components/product/ProductCard";
import { LoadMoreLink } from "@/components/catalog/LoadMoreLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/i18n/routing";
import type { SortOption } from "@/lib/catalog/types";

type SearchParams = {
  category?: string;
  color?: string;
  size?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  cursor?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return buildMetadata({ title: t("products"), path: "/products", locale });
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const sp = await searchParams;

  const [catalogT, navT, breadcrumbT, categories, { items, nextCursor }] =
    await Promise.all([
      getTranslations("catalog"),
      getTranslations("nav"),
      getTranslations("breadcrumb"),
      getCategories(locale as Locale),
      getProducts({
        locale: locale as Locale,
        filters: {
          category: sp.category,
          color: sp.color,
          size: sp.size,
          minPriceCents: sp.minPrice
            ? Math.round(Number(sp.minPrice) * 100)
            : undefined,
          maxPriceCents: sp.maxPrice
            ? Math.round(Number(sp.maxPrice) * 100)
            : undefined,
        },
        sort: (sp.sort as SortOption) ?? "newest",
        cursor: sp.cursor,
      }),
    ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: breadcrumbT("home"), path: "" },
            { name: navT("products"), path: "/products" },
          ],
          locale
        )}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <FiltersSidebar categories={categories} />

        <div>
          <div className="mb-4 flex items-center justify-end">
            <SortSelect />
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-black/60 dark:text-white/60">
              {catalogT("noResults")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </div>
          )}

          {nextCursor && (
            <div className="mt-8 flex justify-center">
              <LoadMoreLink
                basePath="/products"
                searchParams={sp}
                nextCursor={nextCursor}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
