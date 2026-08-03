"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { useTranslations } from "next-intl";
import { startPayment } from "@/actions/checkout";
import { Button } from "@/components/ui/Button";
import type { Locale } from "@/i18n/routing";

export function PaymentButton({
  locale,
  disabled = false,
}: {
  locale: Locale;
  disabled?: boolean;
}) {
  const t = useTranslations("checkout.payment");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(false);

  function onClick() {
    setError(false);
    startTransition(async () => {
      try {
        await startPayment({ locale });
      } catch (submitError) {
        unstable_rethrow(submitError);
        setError(true);
      }
    });
  }

  return (
    <div>
      <Button onClick={onClick} disabled={isPending || disabled} className="w-full">
        {isPending ? t("paying") : t("payCta")}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{t("errorGeneric")}</p>}
    </div>
  );
}
