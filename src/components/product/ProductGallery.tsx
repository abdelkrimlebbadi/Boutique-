"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImageView } from "@/lib/catalog/get-product-by-slug";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImageView[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (!active) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-black/5 dark:bg-white/10">
        <Image
          src={active.url}
          alt={active.alt || productName}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-current={index === activeIndex}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border ${
                index === activeIndex
                  ? "border-black dark:border-white"
                  : "border-transparent"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || productName}
                fill
                sizes="64px"
                className="object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
