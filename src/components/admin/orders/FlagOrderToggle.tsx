"use client";

import { useState, useTransition } from "react";
import { toggleOrderFlag } from "@/actions/admin/orders";
import { Checkbox } from "@/components/admin/ui/Checkbox";

export function FlagOrderToggle({
  orderId,
  initialFlagged,
}: {
  orderId: string;
  initialFlagged: boolean;
}) {
  const [flagged, setFlagged] = useState(initialFlagged);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onChange(next: boolean) {
    setMessage(null);
    const previous = flagged;
    setFlagged(next);
    startTransition(async () => {
      const result = await toggleOrderFlag({ orderId, flagged: next });
      if ("error" in result) {
        setFlagged(previous);
        setMessage(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={flagged}
          disabled={isPending}
          onChange={(event) => onChange(event.target.checked)}
        />
        Ne pas envoyer à Printful (à vérifier avant impression)
      </label>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
