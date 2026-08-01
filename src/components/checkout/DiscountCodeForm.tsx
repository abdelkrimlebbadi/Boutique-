"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { applyDiscountCode, removeDiscountCode } from "@/actions/checkout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function DiscountCodeForm({ appliedCode }: { appliedCode: string | null }) {
  const t = useTranslations("checkout.payment");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onApply() {
    if (!code.trim()) return;
    setError(false);
    startTransition(async () => {
      const result = await applyDiscountCode({ code: code.trim() });
      if (!result.ok) {
        setError(true);
        return;
      }
      setCode("");
      router.refresh();
    });
  }

  function onRemove() {
    startTransition(async () => {
      await removeDiscountCode();
      router.refresh();
    });
  }

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between border border-neutral-200 px-4 py-3 text-sm">
        <span className="text-neutral-700">{t("discountApplied", { code: appliedCode })}</span>
        <button
          type="button"
          onClick={onRemove}
          disabled={isPending}
          className="text-neutral-600 underline underline-offset-2 transition-colors duration-(--duration-base) hover:text-accent-600 disabled:opacity-40"
        >
          {t("removeCta")}
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={t("discountCodePlaceholder")}
          disabled={isPending}
          className="flex-1"
        />
        <Button type="button" variant="secondary" onClick={onApply} disabled={isPending}>
          {t("applyCta")}
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{t("discountInvalid")}</p>}
    </div>
  );
}
