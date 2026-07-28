"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/admin/ui/Input";
import { Select } from "@/components/admin/ui/Select";
import { Button } from "@/components/admin/ui/Button";

const STATUSES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "failed",
];
const PROVIDERS = ["paypal", "youcan_pay", "mock"];

export function OrdersFilterBar({
  initial,
}: {
  initial: { status?: string; provider?: string; from?: string; to?: string; q?: string };
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initial.status ?? "");
  const [provider, setProvider] = useState(initial.provider ?? "");
  const [from, setFrom] = useState(initial.from ?? "");
  const [to, setTo] = useState(initial.to ?? "");
  const [q, setQ] = useState(initial.q ?? "");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (provider) params.set("provider", provider);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (q) params.set("q", q);
    router.push(`/admin/orders?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs">
        <span>Statut</span>
        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Tous</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span>Prestataire</span>
        <Select value={provider} onChange={(event) => setProvider(event.target.value)}>
          <option value="">Tous</option>
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span>Du</span>
        <Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span>Au</span>
        <Input type="date" value={to} onChange={(event) => setTo(event.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        <span>Recherche (n° commande, e-mail)</span>
        <Input value={q} onChange={(event) => setQ(event.target.value)} className="w-56" />
      </label>
      <Button type="submit">Filtrer</Button>
    </form>
  );
}
