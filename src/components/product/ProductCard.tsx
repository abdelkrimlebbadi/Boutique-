import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/currency/format-money";
import { Badge } from "@/components/ui/Badge";
import type { ProductCardView } from "@/lib/catalog/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardView;
  priority?: boolean;
}) {
  const t = useTranslations("product");
  const locale = useLocale();

  return (
    <Link href={`/products/${product.slug}`} className="group flex flex-col gap-3">
      <div className="relative aspect-4/5 overflow-hidden bg-neutral-100">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-(--duration-base) ease-(--ease-standard) group-hover:scale-[1.02]"
            priority={priority}
          />
        )}
        {product.isBestseller && (
          <span className="absolute start-3 top-3">
            <Badge tone="accent">{t("bestseller")}</Badge>
          </span>
        )}
      </div>
      <div className="text-sm">
        <p className="font-medium text-neutral-900 underline decoration-transparent underline-offset-4 transition-colors duration-(--duration-base) group-hover:decoration-neutral-900">
          {product.name}
        </p>
        <p className="mt-0.5 text-neutral-600">
          {t("from")} {formatMoney(product.priceCents, product.currency, locale)}
        </p>
      </div>
    </Link>
  );
}
