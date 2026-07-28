"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { getOrderStatus } from "@/actions/checkout";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 5;

// Polls a handful of times for a webhook that may still be in flight, then
// settles on a static reassurance message rather than polling forever.
export function OrderStatusPoller({ orderId }: { orderId: string }) {
  const t = useTranslations("checkout.confirmation");
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (attempts >= MAX_ATTEMPTS) {
      setGaveUp(true);
      return;
    }
    const timer = setTimeout(async () => {
      const status = await getOrderStatus(orderId);
      if (status && status !== "pending") {
        router.refresh();
        return;
      }
      setAttempts((n) => n + 1);
    }, POLL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [attempts, orderId, router]);

  return (
    <p className="text-sm text-neutral-600">
      {gaveUp ? t("statusPendingReassurance") : t("statusPendingChecking")}
    </p>
  );
}
