"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { setPreferredCurrency } from "@/actions/currency";
import { CURRENCIES, type Currency } from "@/lib/currency/constants";
import { Select } from "@/components/ui/Select";

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
    <label className="inline-flex items-center">
      <span className="sr-only">{t("label")}</span>
      <Select
        aria-label={t("label")}
        value={currency}
        disabled={isPending}
        onChange={(event) => onChange(event.target.value as Currency)}
        compact
      >
        {CURRENCIES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
    </label>
  );
}
