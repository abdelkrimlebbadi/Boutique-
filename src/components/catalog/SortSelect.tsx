"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import type { SortOption } from "@/lib/catalog/types";

export function SortSelect() {
  const t = useTranslations("catalog");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sort = (searchParams.get("sort") as SortOption | null) ?? "newest";

  function onChange(value: SortOption) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("cursor");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span>{t("sortLabel")}</span>
      <select
        value={sort}
        onChange={(event) => onChange(event.target.value as SortOption)}
        className="rounded-md border border-black/10 bg-transparent py-1 ps-2 pe-6 dark:border-white/20"
      >
        <option value="newest">{t("sortNewest")}</option>
        <option value="price_asc">{t("sortPriceAsc")}</option>
        <option value="price_desc">{t("sortPriceDesc")}</option>
      </select>
    </label>
  );
}
