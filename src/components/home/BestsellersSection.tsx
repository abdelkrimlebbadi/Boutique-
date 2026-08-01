import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
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
    <section className="border-t border-neutral-200 py-12 lg:py-20">
      <Container>
        <h2 className="mb-6 font-display text-2xl font-semibold lg:mb-8">
          {t("bestsellersTitle")}
        </h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 sm:gap-x-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index === 0} />
          ))}
        </div>
      </Container>
    </section>
  );
}
