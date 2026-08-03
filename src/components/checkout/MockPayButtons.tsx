"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { useTranslations } from "next-intl";
import { simulateMockPayment } from "@/actions/checkout";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/routing";

export function MockPayButtons({
  orderId,
  externalId,
  amountCents,
  currency,
  locale,
}: {
  orderId: string;
  externalId: string;
  amountCents: number;
  currency: string;
  locale: Locale;
}) {
  const t = useTranslations("checkout.mockPay");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function simulate(outcome: "success" | "failure") {
    setError(null);
    startTransition(async () => {
      try {
        const result = await simulateMockPayment({
          orderId,
          externalId,
          amountCents,
          currency,
          outcome,
          locale,
        });
        if (result?.error) setError(result.error);
      } catch (submitError) {
        unstable_rethrow(submitError);
        setError(t("error"));
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Button onClick={() => simulate("success")} disabled={isPending}>
        {t("simulateSuccess")}
      </Button>
      <Button variant="secondary" onClick={() => simulate("failure")} disabled={isPending}>
        {t("simulateFailure")}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
