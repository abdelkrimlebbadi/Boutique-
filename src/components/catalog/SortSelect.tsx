"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";
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
    <label className="inline-flex items-center gap-2 text-sm text-neutral-700">
      <span>{t("sortLabel")}</span>
      <Select value={sort} onChange={(event) => onChange(event.target.value as SortOption)}>
        <option value="newest">{t("sortNewest")}</option>
        <option value="price_asc">{t("sortPriceAsc")}</option>
        <option value="price_desc">{t("sortPriceDesc")}</option>
      </Select>
    </label>
  );
}
