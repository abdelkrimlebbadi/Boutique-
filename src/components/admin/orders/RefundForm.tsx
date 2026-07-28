"use client";

import { useState, useTransition, type FormEvent } from "react";
import { refundOrder } from "@/actions/admin/orders";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";

export function RefundForm({
  orderId,
  totalCents,
  currency,
}: {
  orderId: string;
  totalCents: number;
  currency: string;
}) {
  const [amount, setAmount] = useState((totalCents / 100).toFixed(2));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setMessage(null);
    const amountCents = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      setMessage("Montant invalide.");
      return;
    }
    startTransition(async () => {
      const result = await refundOrder({ orderId, amountCents });
      if ("error" in result) {
        setMessage(result.error);
      } else {
        setMessage("Remboursement effectué.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span>Montant à rembourser ({currency})</span>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          max={(totalCents / 100).toFixed(2)}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </label>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Remboursement..." : "Rembourser"}
      </Button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
