"use client";

import { useTranslations } from "next-intl";
import { useCart } from "./CartProvider";

export function CartTrigger() {
  const t = useTranslations("cart");
  const { cart, open } = useCart();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={t("title", { count: cart.itemCount })}
      className="relative rounded-md border border-black/10 px-3 py-1 text-sm dark:border-white/20"
    >
      {t("cartLabel")}
      {cart.itemCount > 0 && (
        <span className="absolute -top-2 -end-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs text-white dark:bg-white dark:text-black">
          {cart.itemCount}
        </span>
      )}
    </button>
  );
}
