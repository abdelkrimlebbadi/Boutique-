"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getShippingEstimateAction } from "@/actions/shipping";
import { formatMoney } from "@/lib/currency/format-money";
import { Select } from "@/components/ui/Select";
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
    <div className="border border-neutral-200 p-4 text-sm">
      <p className="mb-3 font-medium text-neutral-900">
        {t("shippingEstimateTitle")}
      </p>
      <label className="flex items-center gap-3">
        <span className="text-neutral-600">{t("selectCountry")}</span>
        <Select value={countryCode} onChange={(event) => onCountryChange(event.target.value)}>
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.label}
            </option>
          ))}
        </Select>
      </label>
      {isPending && <p className="mt-2 text-neutral-500">…</p>}
      {!isPending && checked && (
        <p className="mt-2 text-neutral-700">
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
