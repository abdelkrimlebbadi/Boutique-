"use client";

import { useState } from "react";
import { Input } from "@/components/admin/ui/Input";
import { Select } from "@/components/admin/ui/Select";
import { Button } from "@/components/admin/ui/Button";
import type { ProductEditData } from "@/lib/admin/products-query";
import type { Currency } from "@/lib/currency/constants";

export type VariantValue = ProductEditData["variants"][number];
const OVERRIDE_CURRENCIES = ["MAD", "EUR", "GBP"] as const;

function emptyVariant(): VariantValue {
  return {
    id: null,
    sku: "",
    size: null,
    color: null,
    printfulVariantId: null,
    stockPolicy: "made_to_order",
    weightGrams: null,
    printAreaWidthPx: null,
    printAreaHeightPx: null,
    printAreaDpi: null,
    prices: [{ currency: "USD", amountCents: 0, compareAtCents: null }],
  };
}

function VariantRow({
  value,
  onChange,
  onRemove,
}: {
  value: VariantValue;
  onChange: (next: VariantValue) => void;
  onRemove: () => void;
}) {
  const [showOverrides, setShowOverrides] = useState(
    value.prices.some((p) => p.currency !== "USD")
  );
  const usdPrice = value.prices.find((p) => p.currency === "USD");

  function setUsdAmount(cents: number) {
    const others = value.prices.filter((p) => p.currency !== "USD");
    onChange({ ...value, prices: [{ currency: "USD", amountCents: cents, compareAtCents: null }, ...others] });
  }

  function setOverrideAmount(currency: Currency, cents: number | null) {
    const others = value.prices.filter((p) => p.currency !== currency && p.currency !== "USD");
    const usd = value.prices.find((p) => p.currency === "USD");
    const next = usd ? [usd, ...others] : others;
    if (cents != null) next.push({ currency, amountCents: cents, compareAtCents: null });
    onChange({ ...value, prices: next });
  }

  return (
    <div className="border border-black p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="flex flex-col gap-1 text-xs">
          <span>SKU</span>
          <Input required value={value.sku} onChange={(e) => onChange({ ...value, sku: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>Taille</span>
          <Input value={value.size ?? ""} onChange={(e) => onChange({ ...value, size: e.target.value || null })} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>Couleur</span>
          <Input value={value.color ?? ""} onChange={(e) => onChange({ ...value, color: e.target.value || null })} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>Stock</span>
          <Select
            value={value.stockPolicy}
            onChange={(e) => onChange({ ...value, stockPolicy: e.target.value as VariantValue["stockPolicy"] })}
          >
            <option value="made_to_order">À la demande</option>
            <option value="in_stock">En stock</option>
            <option value="out_of_stock">Rupture</option>
          </Select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>Poids (g)</span>
          <Input
            type="number"
            min={1}
            value={value.weightGrams ?? ""}
            onChange={(e) => onChange({ ...value, weightGrams: e.target.value ? Number(e.target.value) : null })}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>ID variante Printful (sync)</span>
          <Input
            value={value.printfulVariantId ?? ""}
            onChange={(e) => onChange({ ...value, printfulVariantId: e.target.value || null })}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span>Prix USD (cents)</span>
          <Input
            type="number"
            required
            min={0}
            value={usdPrice?.amountCents ?? 0}
            onChange={(e) => setUsdAmount(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="mt-3 border-t border-black pt-3">
        <span className="mb-2 block text-xs">
          Zone d&apos;impression (personnalisation) — laisser vide si non personnalisable
        </span>
        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1 text-xs">
            <span>Largeur (px)</span>
            <Input
              type="number"
              min={1}
              value={value.printAreaWidthPx ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  printAreaWidthPx: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span>Hauteur (px)</span>
            <Input
              type="number"
              min={1}
              value={value.printAreaHeightPx ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  printAreaHeightPx: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span>DPI</span>
            <Input
              type="number"
              min={1}
              value={value.printAreaDpi ?? ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  printAreaDpi: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowOverrides((v) => !v)}
        className="mt-2 text-xs underline underline-offset-2"
      >
        {showOverrides ? "Masquer" : "Prix par devise (optionnel)"}
      </button>
      {showOverrides && (
        <div className="mt-2 grid grid-cols-3 gap-2">
          {OVERRIDE_CURRENCIES.map((currency) => {
            const existing = value.prices.find((p) => p.currency === currency);
            return (
              <label key={currency} className="flex flex-col gap-1 text-xs">
                <span>{currency} (cents)</span>
                <Input
                  type="number"
                  min={0}
                  value={existing?.amountCents ?? ""}
                  onChange={(e) =>
                    setOverrideAmount(currency, e.target.value ? Number(e.target.value) : null)
                  }
                />
              </label>
            );
          })}
        </div>
      )}

      <Button type="button" size="sm" onClick={onRemove} className="mt-3">
        Retirer cette variante
      </Button>
    </div>
  );
}

export function VariantsEditor({
  value,
  onChange,
}: {
  value: VariantValue[];
  onChange: (next: VariantValue[]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {value.map((variant, index) => (
        <VariantRow
          key={variant.id ?? `new-${index}`}
          value={variant}
          onChange={(next) => onChange(value.map((v, i) => (i === index ? next : v)))}
          onRemove={() => onChange(value.filter((_, i) => i !== index))}
        />
      ))}
      <Button type="button" size="sm" onClick={() => onChange([...value, emptyVariant()])}>
        Ajouter une variante
      </Button>
    </div>
  );
}
