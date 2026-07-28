import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { searchProducts } from "@/lib/catalog/search-products";
import { SearchInput } from "@/components/search/SearchInput";
import { ProductCard } from "@/components/product/ProductCard";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "search" });
  return buildMetadata({ title: t("title"), path: "/search", locale });
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const { q } = await searchParams;

  const [t, results] = await Promise.all([
    getTranslations("search"),
    q ? searchProducts(q, locale as Locale) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="sr-only">{t("title")}</h1>
      <div className="mx-auto max-w-xl">
        <SearchInput />
      </div>

      <div className="mt-8">
        {!q && <p className="text-black/60 dark:text-white/60">{t("prompt")}</p>}
        {q && results.length === 0 && (
          <p className="text-black/60 dark:text-white/60">
            {t("noResults", { query: q })}
          </p>
        )}
        {q && results.length > 0 && (
          <>
            <p className="mb-4 text-sm text-black/60 dark:text-white/60">
              {t("resultsCount", { count: results.length, query: q })}
            </p>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
