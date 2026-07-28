"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
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
      className="flex flex-col gap-6"
      aria-busy={isPending}
      aria-label={t("filtersTitle")}
    >
      <div>
        <h2 className="mb-2 text-sm font-semibold">{t("categoryLabel")}</h2>
        <ul className="flex flex-col gap-1 text-sm">
          <li>
            <button
              type="button"
              onClick={() => updateParam("category", null)}
              className={!activeCategory ? "font-semibold" : "text-black/60 dark:text-white/60"}
            >
              {t("allCategories")}
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => updateParam("category", category.slug)}
                className={
                  activeCategory === category.slug
                    ? "font-semibold"
                    : "text-black/60 dark:text-white/60"
                }
              >
                {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">{t("colorLabel")}</h2>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => updateParam("color", activeColor === color ? null : color)}
              aria-pressed={activeColor === color}
              className={`rounded-full border px-3 py-1 text-sm ${
                activeColor === color
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/20 dark:border-white/20"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">{t("sizeLabel")}</h2>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => updateParam("size", activeSize === size ? null : size)}
              aria-pressed={activeSize === size}
              className={`rounded-full border px-3 py-1 text-sm ${
                activeSize === size
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-black/20 dark:border-white/20"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">{t("priceLabel")}</h2>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="minPrice">
            {t("minPrice")}
          </label>
          <input
            id="minPrice"
            type="number"
            min={0}
            placeholder={t("minPrice")}
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
            className="w-20 rounded-md border border-black/10 px-2 py-1 text-sm dark:border-white/20"
          />
          <span>–</span>
          <label className="sr-only" htmlFor="maxPrice">
            {t("maxPrice")}
          </label>
          <input
            id="maxPrice"
            type="number"
            min={0}
            placeholder={t("maxPrice")}
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            className="w-20 rounded-md border border-black/10 px-2 py-1 text-sm dark:border-white/20"
          />
          <button
            type="button"
            onClick={applyPriceRange}
            className="rounded-md border border-black/10 px-2 py-1 text-sm dark:border-white/20"
          >
            {t("applyFilters")}
          </button>
        </div>
      </div>
    </aside>
  );
}
