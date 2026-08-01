"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Tag } from "@/components/ui/Tag";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { CategoryView } from "@/lib/catalog/types";

const COLORS = ["Noir", "Blanc"];
const SIZES = ["S", "M", "L", "A3", "A2"];

export function FiltersSidebar({ categories }: { categories: CategoryView[] }) {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("cursor"); // any filter change resets pagination
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");
    params.delete("cursor");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const activeCategory = searchParams.get("category");
  const activeColor = searchParams.get("color");
  const activeSize = searchParams.get("size");

  return (
    <aside
      className="flex flex-col gap-8"
      aria-busy={isPending}
      aria-label={t("filtersTitle")}
    >
      <div>
        <h2 className="mb-3 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          {t("categoryLabel")}
        </h2>
        <ul className="flex flex-col gap-2 text-sm">
          <li>
            <button
              type="button"
              onClick={() => updateParam("category", null)}
              aria-current={!activeCategory}
              className={
                !activeCategory
                  ? "font-medium text-neutral-900"
                  : "text-neutral-600 transition-colors duration-(--duration-base) hover:text-neutral-900"
              }
            >
              {t("allCategories")}
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => updateParam("category", category.slug)}
                aria-current={activeCategory === category.slug}
                className={
                  activeCategory === category.slug
                    ? "font-medium text-neutral-900"
                    : "text-neutral-600 transition-colors duration-(--duration-base) hover:text-neutral-900"
                }
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          {t("colorLabel")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <Tag
              key={color}
              pressed={activeColor === color}
              onClick={() => updateParam("color", activeColor === color ? null : color)}
            >
              {color}
            </Tag>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          {t("sizeLabel")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <Tag
              key={size}
              pressed={activeSize === size}
              onClick={() => updateParam("size", activeSize === size ? null : size)}
            >
              {size}
            </Tag>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold tracking-wide text-neutral-500 uppercase">
          {t("priceLabel")}
        </h2>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="minPrice">
            {t("minPrice")}
          </label>
          <Input
            id="minPrice"
            type="number"
            min={0}
            placeholder={t("minPrice")}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="h-9 w-full"
          />
          <span aria-hidden className="text-neutral-400">
            –
          </span>
          <label className="sr-only" htmlFor="maxPrice">
            {t("maxPrice")}
          </label>
          <Input
            id="maxPrice"
            type="number"
            min={0}
            placeholder={t("maxPrice")}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="h-9 w-full"
          />
        </div>
        <Button variant="secondary" size="sm" onClick={applyPriceRange} className="mt-3 w-full">
          {t("applyFilters")}
        </Button>
      </div>
    </aside>
  );
}
