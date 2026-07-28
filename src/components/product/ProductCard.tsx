import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/currency/format-money";
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
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col gap-2"
    >
      <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt ?? product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
            priority={priority}
          />
        )}
        {product.isBestseller && (
          <span className="absolute start-2 top-2 rounded-full bg-black px-2 py-1 text-xs text-white dark:bg-white dark:text-black">
            ★
          </span>
        )}
      </div>
      <div className="text-sm">
        <p className="font-medium">{product.name}</p>
        <p className="text-black/60 dark:text-white/60">
          {t("from")} {formatMoney(product.priceCents, product.currency, locale)}
        </p>
      </div>
    </Link>
  );
}
