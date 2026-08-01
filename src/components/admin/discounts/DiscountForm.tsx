"use client";

import { useState, useTransition, type FormEvent } from "react";
import { unstable_rethrow } from "next/navigation";
import { saveDiscountCode } from "@/actions/admin/discounts";
import { Input } from "@/components/admin/ui/Input";
import { Select } from "@/components/admin/ui/Select";
import { Checkbox } from "@/components/admin/ui/Checkbox";
import { Button } from "@/components/admin/ui/Button";
import type { DiscountCodeRow } from "@/lib/admin/discounts-query";

export function DiscountForm({ initial }: { initial: DiscountCodeRow | null }) {
  const [code, setCode] = useState(initial?.code ?? "");
  const [type, setType] = useState<"fixed" | "percentage">(initial?.type ?? "fixed");
  const [amountCents, setAmountCents] = useState(initial?.amount_cents?.toString() ?? "");
  const [percentage, setPercentage] = useState(initial?.percentage?.toString() ?? "");
  const [maxUses, setMaxUses] = useState(initial?.max_uses?.toString() ?? "");
  const [expiresAt, setExpiresAt] = useState(initial?.expires_at?.slice(0, 10) ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await saveDiscountCode({
          id: initial?.id ?? null,
          code,
          type,
          amountCents: amountCents ? Number(amountCents) : null,
          percentage: percentage ? Number(percentage) : null,
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
          active,
        });
        if (result?.error) setError(result.error);
      } catch (submitError) {
        unstable_rethrow(submitError);
        setError("Une erreur est survenue.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>Code</span>
        <Input
          required
          value={code}
          onChange={(event) => setCode(event.target.value.toUpperCase())}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Type</span>
        <Select value={type} onChange={(event) => setType(event.target.value as "fixed" | "percentage")}>
          <option value="fixed">Montant fixe</option>
          <option value="percentage">Pourcentage</option>
        </Select>
      </label>
      {type === "fixed" ? (
        <label className="flex flex-col gap-1 text-sm">
          <span>Montant (cents)</span>
          <Input
            type="number"
            required
            min={0}
            value={amountCents}
            onChange={(event) => setAmountCents(event.target.value)}
          />
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-sm">
          <span>Pourcentage</span>
          <Input
            type="number"
            required
            min={1}
            max={100}
            value={percentage}
            onChange={(event) => setPercentage(event.target.value)}
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span>Utilisations maximum (optionnel)</span>
        <Input type="number" min={1} value={maxUses} onChange={(event) => setMaxUses(event.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Expiration (optionnel)</span>
        <Input type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={active} onChange={(event) => setActive(event.target.checked)} />
        Actif
      </label>
      {error && <p className="text-sm">{error}</p>}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
