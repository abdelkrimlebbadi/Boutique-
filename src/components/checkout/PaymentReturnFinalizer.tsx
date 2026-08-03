"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { finalizePaymentReturn } from "@/actions/checkout";

// PayPal sends the customer back once they approve, but approval alone
// charges nothing — the capture has to be requested. This fires it as soon
// as the confirmation page mounts on a still-pending order, then refreshes
// so the page reflects the settled status. A no-op for providers that
// settle at approval time (the action checks).
export function PaymentReturnFinalizer({ orderId }: { orderId: string }) {
  const router = useRouter();
  const hasRun = useRef(false);

  useEffect(() => {
    // Guarded: React runs effects twice in development, and capturing twice
    // would hit PayPal with an order it has already settled.
    if (hasRun.current) return;
    hasRun.current = true;

    finalizePaymentReturn(orderId)
      .then(() => router.refresh())
      .catch(() => {
        // Leave it to OrderStatusPoller and the webhook — a failure here
        // must not replace the confirmation page with an error screen.
      });
  }, [orderId, router]);

  return null;
}
