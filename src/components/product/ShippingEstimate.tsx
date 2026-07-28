"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getShippingEstimateAction } from "@/actions/shipping";
import { formatMoney } from "@/lib/currency/format-money";
import type { ShippingEstimate as ShippingEstimateResult } from "@/lib/catalog/get-shipping-estimate";

const COUNTRIES = [
  { code: "MA", label: "Maroc" },
  { code: "FR", label: "France" },
  { code: "ES", label: "España" },
  { code: "DE", label: "Deutschland" },
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
];

export function ShippingEstimate({ weightGrams }: { weightGrams: number | null }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [countryCode, setCountryCode] = useState(COUNTRIES[0].code);
  const [estimate, setEstimate] = useState<ShippingEstimateResult | null>(null);
  const [checked, setChecked] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onCountryChange(value: string) {
    setCountryCode(value);
    if (!weightGrams) return;
    startTransition(async () => {
      const result = await getShippingEstimateAction({
        countryCode: value,
        weightGrams,
      });
      setEstimate(result);
      setChecked(true);
    });
  }

  const countryLabel = COUNTRIES.find((c) => c.code === countryCode)?.label ?? countryCode;

  return (
    <div className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/20">
      <p className="mb-2 font-medium">{t("shippingEstimateTitle")}</p>
      <label className="flex items-center gap-2">
        <span>{t("selectCountry")}</span>
        <select
          value={countryCode}
          onChange={(event) => onCountryChange(event.target.value)}
          className="rounded-md border border-black/10 bg-transparent py-1 ps-2 pe-6 dark:border-white/20"
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.label}
            </option>
          ))}
        </select>
      </label>
      {isPending && <p className="mt-2 text-black/50 dark:text-white/50">…</p>}
      {!isPending && checked && (
        <p className="mt-2">
          {estimate
            ? t("shippingEstimateResult", {
                country: countryLabel,
                price: formatMoney(estimate.priceCents, estimate.currency, locale),
              })
            : t("shippingEstimateUnavailable")}
        </p>
      )}
    </div>
  );
}
