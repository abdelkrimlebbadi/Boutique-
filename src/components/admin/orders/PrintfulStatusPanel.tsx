"use client";

import { useState, useTransition } from "react";
import { refreshPrintfulOrderStatus } from "@/actions/admin/orders";
import { Button } from "@/components/admin/ui/Button";

export function PrintfulStatusPanel({ printfulOrderId }: { printfulOrderId: string }) {
  const [result, setResult] = useState<{ status: string; raw: unknown } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onRefresh() {
    setError(null);
    startTransition(async () => {
      const response = await refreshPrintfulOrderStatus({ printfulOrderId });
      if ("error" in response) {
        setError(response.error);
        return;
      }
      setResult({ status: response.status, raw: response.raw });
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" size="sm" onClick={onRefresh} disabled={isPending}>
        {isPending ? "Actualisation..." : "Actualiser depuis Printful"}
      </Button>
      {error && <p className="text-sm">{error}</p>}
      {result && (
        <div>
          <p className="text-sm">
            Statut Printful : <strong>{result.status}</strong>
          </p>
          <details className="mt-1 text-xs">
            <summary className="cursor-pointer">Voir la réponse brute</summary>
            <pre className="mt-1 overflow-x-auto border border-black p-2">
              {JSON.stringify(result.raw, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
