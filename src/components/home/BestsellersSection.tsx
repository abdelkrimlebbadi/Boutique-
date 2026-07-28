import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardView } from "@/lib/catalog/types";

export function BestsellersSection({
  products,
}: {
  products: ProductCardView[];
}) {
  const t = useTranslations("home");
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="mb-4 text-xl font-semibold">{t("bestsellersTitle")}</h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index === 0} />
        ))}
      </div>
    </section>
  );
}
