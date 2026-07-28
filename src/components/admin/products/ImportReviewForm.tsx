"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { importPrintfulProduct } from "@/actions/admin/products";
import { Checkbox } from "@/components/admin/ui/Checkbox";
import { Button } from "@/components/admin/ui/Button";
import { psychologicalRoundCents } from "@/lib/currency/psychological-round";
import type { CatalogProductDetail } from "@/lib/printful/catalog";

export function ImportReviewForm({ detail }: { detail: CatalogProductDetail }) {
  const [selected, setSelected] = useState<Set<number>>(new Set(detail.variants.map((v) => v.id)));
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle(variantId: number, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(variantId);
      else next.delete(variantId);
      return next;
    });
  }

  function onSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await importPrintfulProduct({
          catalogProductId: detail.id,
          selectedVariantIds: [...selected],
        });
        if (result?.error) setError(result.error);
      } catch (submitError) {
        unstable_rethrow(submitError);
        setError("Une erreur est survenue.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {detail.variants.map((variant) => (
          <li key={variant.id} className="flex items-center gap-3 border border-black p-2 text-sm">
            <Checkbox
              checked={selected.has(variant.id)}
              onChange={(event) => toggle(variant.id, event.target.checked)}
            />
            <span className="flex-1">
              {variant.name}
              {variant.size ? ` — ${variant.size}` : ""}
              {variant.color ? ` / ${variant.color}` : ""}
            </span>
            <span className="tabular-nums text-neutral-500">
              Prix suggéré : {(psychologicalRoundCents(variant.costCents * 2) / 100).toFixed(2)} $US
            </span>
          </li>
        ))}
      </ul>
      {error && <p className="text-sm">{error}</p>}
      <Button type="button" onClick={onSubmit} disabled={isPending || selected.size === 0}>
        {isPending ? "Import..." : `Importer ${selected.size} variante(s)`}
      </Button>
    </div>
  );
}
