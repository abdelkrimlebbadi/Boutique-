"use client";

import { useState } from "react";
import { VariantSelector } from "./VariantSelector";
import { ShippingEstimate } from "./ShippingEstimate";
import { SizeGuide } from "./SizeGuide";
import type { ProductVariantView } from "@/lib/catalog/get-product-by-slug";

export function ProductPurchasePanel({
  productSlug,
  productName,
  imageUrl,
  variants,
}: {
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  variants: ProductVariantView[];
}) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantView | null>(
    variants[0] ?? null
  );
  const hasSizes = variants.some((variant) => variant.size);

  return (
    <div className="flex flex-col gap-6">
      <VariantSelector
        productSlug={productSlug}
        productName={productName}
        imageUrl={imageUrl}
        variants={variants}
        onVariantChange={setSelectedVariant}
      />
      {hasSizes && <SizeGuide />}
      <ShippingEstimate weightGrams={selectedVariant?.weightGrams ?? null} />
    </div>
  );
}
