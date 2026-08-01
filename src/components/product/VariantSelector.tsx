"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/currency/format-money";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import type { ProductVariantView } from "@/lib/catalog/get-product-by-slug";

export function VariantSelector({
  productSlug,
  productName,
  imageUrl,
  variants,
  onVariantChange,
}: {
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  variants: ProductVariantView[];
  onVariantChange?: (variant: ProductVariantView | null) => void;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const { addItem, isPending } = useCart();

  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter((c): c is string => !!c))],
    [variants]
  );
  const sizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter((s): s is string => !!s))],
    [variants]
  );

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0] ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes[0] ?? null
  );

  const selectedVariant =
    variants.find(
      (v) =>
        (colors.length === 0 || v.color === selectedColor) &&
        (sizes.length === 0 || v.size === selectedSize)
    ) ?? null;

  function selectColor(color: string) {
    setSelectedColor(color);
    onVariantChange?.(
      variants.find((v) => v.color === color && v.size === selectedSize) ?? null
    );
  }

  function selectSize(size: string) {
    setSelectedSize(size);
    onVariantChange?.(
      variants.find((v) => v.color === selectedColor && v.size === size) ?? null
    );
  }

  function onAddToCart() {
    if (!selectedVariant) return;
    addItem(
      {
        variantId: selectedVariant.id,
        sku: selectedVariant.sku,
        size: selectedVariant.size,
        color: selectedVariant.color,
        productSlug,
        productName,
        imageUrl,
        priceCents: selectedVariant.priceCents,
      },
      1
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {selectedVariant && (
        <p className="font-display text-2xl font-semibold">
          {formatMoney(selectedVariant.priceCents, selectedVariant.currency, locale)}
        </p>
      )}

      {colors.length > 0 && (
        <div>
          <span className="mb-3 block text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            {t("selectColor")}
          </span>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <Tag
                key={color}
                pressed={selectedColor === color}
                onClick={() => selectColor(color)}
              >
                {color}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <span className="mb-3 block text-xs font-semibold tracking-wide text-neutral-500 uppercase">
            {t("selectSize")}
          </span>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <Tag
                key={size}
                pressed={selectedSize === size}
                onClick={() => selectSize(size)}
              >
                {size}
              </Tag>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onAddToCart} disabled={!selectedVariant || isPending}>
        {isPending
          ? t("adding")
          : selectedVariant
            ? t("addToCart")
            : t("outOfStock")}
      </Button>
    </div>
  );
}
