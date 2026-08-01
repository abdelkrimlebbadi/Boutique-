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
      <div className="relative aspect-4/5 overflow-hidden bg-neutral-100">
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
        <div className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-current={index === activeIndex}
              aria-label={`${productName} ${index + 1}`}
              className={`relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-100 transition-opacity duration-(--duration-base) ${
                index === activeIndex
                  ? "opacity-100 ring-2 ring-neutral-900 ring-inset"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt=""
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
