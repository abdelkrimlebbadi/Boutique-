import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import type { ProductCardView } from "@/lib/catalog/types";

// Product photography dominant, text-led on mobile: the image comes first
// in source order (it's what should register first while scrolling on a
// phone), text and CTA follow. On desktop the two sit side by side.
export function Hero({ featuredProduct }: { featuredProduct: ProductCardView | null }) {
  const t = useTranslations("home");

  return (
    <section className="border-b border-neutral-200">
      <Container className="grid grid-cols-1 items-center gap-8 py-8 lg:grid-cols-2 lg:gap-16 lg:py-0">
        <div className="relative order-1 aspect-4/5 w-full bg-neutral-100 lg:order-2 lg:aspect-auto lg:h-[36rem]">
          {featuredProduct?.imageUrl && (
            <Image
              src={featuredProduct.imageUrl}
              alt={featuredProduct.imageAlt ?? featuredProduct.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          )}
        </div>

        <div className="order-2 flex flex-col items-start gap-6 lg:order-1">
          <h1 className="font-display text-3xl font-semibold text-balance">
            {t("title")}
          </h1>
          <p className="max-w-md text-md text-neutral-600">{t("subtitle")}</p>
          <Link
            href="/products"
            className="inline-flex h-12 items-center bg-neutral-900 px-6 text-base font-medium text-neutral-0 transition-colors duration-(--duration-base) ease-(--ease-standard) hover:bg-accent-600"
          >
            {t("heroCta")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
