"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setPreferredCurrency } from "@/actions/currency";
import { CURRENCIES, type Currency } from "@/lib/currency/constants";

export function CurrencySwitcher({
  initialCurrency,
}: {
  initialCurrency: Currency;
}) {
  const t = useTranslations("currencySwitcher");
  const router = useRouter();
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [isPending, startTransition] = useTransition();

  function onChange(nextCurrency: Currency) {
    setCurrency(nextCurrency);
    startTransition(async () => {
      await setPreferredCurrency(nextCurrency);
      router.refresh();
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        value={currency}
        disabled={isPending}
        onChange={(event) => onChange(event.target.value as Currency)}
        className="rounded-md border border-black/10 bg-transparent py-1 ps-2 pe-6 dark:border-white/20"
      >
        {CURRENCIES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  );
}
