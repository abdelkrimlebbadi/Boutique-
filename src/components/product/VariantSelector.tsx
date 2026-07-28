"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/currency/format-money";
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
    <div className="flex flex-col gap-4">
      {selectedVariant && (
        <p className="text-2xl font-semibold">
          {formatMoney(selectedVariant.priceCents, selectedVariant.currency, locale)}
        </p>
      )}

      {colors.length > 0 && (
        <div>
          <span className="mb-2 block text-sm font-medium">
            {t("selectColor")}
          </span>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => selectColor(color)}
                aria-pressed={selectedColor === color}
                className={`rounded-full border px-3 py-1 text-sm ${
                  selectedColor === color
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-black/20 dark:border-white/20"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <span className="mb-2 block text-sm font-medium">
            {t("selectSize")}
          </span>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => selectSize(size)}
                aria-pressed={selectedSize === size}
                className={`rounded-md border px-3 py-1 text-sm ${
                  selectedSize === size
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-black/20 dark:border-white/20"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onAddToCart}
        disabled={!selectedVariant || isPending}
        className="rounded-md bg-black px-6 py-3 font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {isPending
          ? t("adding")
          : selectedVariant
            ? t("addToCart")
            : t("outOfStock")}
      </button>
    </div>
  );
}
