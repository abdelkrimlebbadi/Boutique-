"use client";

import { useState } from "react";
import { BarChart, type BarChartDatum } from "@/components/admin/charts/BarChart";
import type { DailyRevenuePoint } from "@/lib/admin/dashboard-metrics";

export function CurrencyTabs({
  perCurrency,
}: {
  perCurrency: Record<string, DailyRevenuePoint[]>;
}) {
  const currencies = Object.keys(perCurrency);
  const [selected, setSelected] = useState(currencies[0] ?? "");
  const active = currencies.includes(selected) ? selected : currencies[0];

  if (currencies.length === 0) {
    return <p className="text-sm text-neutral-500">Aucune commande sur cette période.</p>;
  }

  const data: BarChartDatum[] = (perCurrency[active] ?? []).map((row) => ({
    label: row.day.slice(5),
    value: row.totalCents / 100,
  }));

  return (
    <div>
      <div className="mb-3 flex gap-1">
        {currencies.map((currency) => (
          <button
            key={currency}
            type="button"
            onClick={() => setSelected(currency)}
            className={
              "border border-black px-3 py-1 text-xs font-medium uppercase transition-colors duration-(--duration-base) " +
              (currency === active ? "bg-black text-white" : "hover:bg-black hover:text-white")
            }
          >
            {currency}
          </button>
        ))}
      </div>
      <BarChart data={data} valueFormatter={(value) => Math.round(value).toLocaleString("fr-FR")} />
    </div>
  );
}
