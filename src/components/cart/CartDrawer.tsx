"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "./CartProvider";
import { updateCartItemQuantity, removeCartItem } from "@/actions/cart";
import { formatMoney } from "@/lib/currency/format-money";
import { useTransition } from "react";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { cart, isOpen, close, open } = useCart();
  const [isPending, startTransition] = useTransition();

  function onQuantityChange(itemId: string, quantity: number) {
    startTransition(async () => {
      await updateCartItemQuantity({ itemId, quantity });
    });
  }

  function onRemove(itemId: string) {
    startTransition(async () => {
      await removeCartItem({ itemId });
    });
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(next) => (next ? open() : close())}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content
          className="fixed inset-y-0 end-0 z-50 flex w-full max-w-sm translate-x-full rtl:-translate-x-full flex-col bg-white shadow-xl transition-transform duration-200 data-[state=open]:translate-x-0 dark:bg-black"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-black/10 p-4 dark:border-white/20">
            <Dialog.Title className="font-semibold">
              {t("title", { count: cart.itemCount })}
            </Dialog.Title>
            <Dialog.Close aria-label={t("close")} className="p-1">
              ✕
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.items.length === 0 ? (
              <p className="text-sm text-black/60 dark:text-white/60">
                {t("empty")}
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    {item.imageUrl && (
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-black/5">
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt ?? item.productName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-1 text-sm">
                      <span className="font-medium">{item.productName}</span>
                      <span className="text-black/60 dark:text-white/60">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="sr-only" htmlFor={`qty-${item.id}`}>
                          {t("quantity")}
                        </label>
                        <input
                          id={`qty-${item.id}`}
                          type="number"
                          min={1}
                          max={20}
                          value={item.quantity}
                          disabled={isPending}
                          onChange={(event) =>
                            onQuantityChange(item.id, Number(event.target.value))
                          }
                          className="w-14 rounded-md border border-black/10 px-2 py-1 dark:border-white/20"
                        />
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => onRemove(item.id)}
                          className="text-black/50 underline hover:text-black dark:text-white/50 dark:hover:text-white"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                    <span className="whitespace-nowrap font-medium">
                      {formatMoney(item.lineTotalCents, cart.currency, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cart.items.length > 0 && (
            <div className="border-t border-black/10 p-4 dark:border-white/20">
              <div className="flex justify-between font-semibold">
                <span>{t("subtotal")}</span>
                <span>{formatMoney(cart.subtotalCents, cart.currency, locale)}</span>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
