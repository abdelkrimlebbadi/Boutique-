"use client";

import { useTranslations } from "next-intl";
import { useCart } from "./CartProvider";
import { CountBadge } from "@/components/ui/CountBadge";

export function CartTrigger() {
  const t = useTranslations("cart");
  const { cart, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={t("title", { count: cart.itemCount })}
      className="inline-flex items-center gap-2 text-sm text-neutral-900 transition-colors duration-(--duration-base) hover:text-accent-600"
    >
      {t("cartLabel")}
      {cart.itemCount > 0 && <CountBadge count={cart.itemCount} />}
    </button>
  );
}
