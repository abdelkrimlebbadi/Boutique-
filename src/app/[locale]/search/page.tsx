import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { searchProducts } from "@/lib/catalog/search-products";
import { SearchInput } from "@/components/search/SearchInput";
import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui/Container";
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
    <Container className="py-8 lg:py-12">
      <h1 className="sr-only">{t("title")}</h1>
      <div className="mx-auto max-w-xl">
        <SearchInput />
      </div>

      <div className="mt-10">
        {!q && <p className="text-center text-neutral-500">{t("prompt")}</p>}
        {q && results.length === 0 && (
          <p className="text-center text-neutral-500">
            {t("noResults", { query: q })}
          </p>
        )}
        {q && results.length > 0 && (
          <>
            <p className="mb-6 text-sm text-neutral-600">
              {t("resultsCount", { count: results.length, query: q })}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
              {results.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
