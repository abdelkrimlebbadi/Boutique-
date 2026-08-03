"use client";

import { useState } from "react";
import { DesignCompositor, type PendingDesign } from "./DesignCompositor";
import { PaymentButton } from "./PaymentButton";
import type { Locale } from "@/i18n/routing";

// Shares "are all customized cart lines flattened into a print file yet"
// state between the two client components: DesignCompositor produces it,
// PaymentButton consumes it to stay disabled until it's true. Zero pending
// designs means ready immediately — most carts never touch this.
export function PaymentSection({
  locale,
  pendingDesigns,
}: {
  locale: Locale;
  pendingDesigns: PendingDesign[];
}) {
  const [isReady, setIsReady] = useState(pendingDesigns.length === 0);

  return (
    <div className="flex flex-col gap-4">
      {pendingDesigns.length > 0 && (
        <DesignCompositor pendingDesigns={pendingDesigns} onReady={setIsReady} />
      )}
      <PaymentButton locale={locale} disabled={!isReady} />
    </div>
  );
}
