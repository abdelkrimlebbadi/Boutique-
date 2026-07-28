"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";
import { useCart } from "./CartProvider";
import { updateCartItemQuantity, removeCartItem } from "@/actions/cart";
import { formatMoney } from "@/lib/currency/format-money";
import { Input } from "@/components/ui/Input";
import { Link } from "@/i18n/navigation";

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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-neutral-900/50 data-[state=open]:animate-none" />
        <Dialog.Content
          className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md translate-x-full flex-col border-s border-neutral-200 bg-neutral-0 transition-transform duration-(--duration-base) ease-(--ease-standard) rtl:-translate-x-full rtl:translate-x-0 data-[state=open]:translate-x-0"
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <Dialog.Title className="font-display text-lg font-semibold">
              {t("title", { count: cart.itemCount })}
            </Dialog.Title>
            <Dialog.Close
              aria-label={t("close")}
              className="flex h-9 w-9 items-center justify-center text-neutral-700 transition-colors duration-(--duration-base) hover:text-accent-600"
            >
              ✕
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {cart.items.length === 0 ? (
              <p className="text-sm text-neutral-600">{t("empty")}</p>
            ) : (
              <ul className="flex flex-col gap-5">
                {cart.items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    {item.imageUrl && (
                      <div className="relative aspect-4/5 h-24 w-19 shrink-0 bg-neutral-100">
                        <Image
                          src={item.imageUrl}
                          alt={item.imageAlt ?? item.productName}
                          fill
                          sizes="76px"
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col gap-1 text-sm">
                      <span className="font-medium text-neutral-900">
                        {item.productName}
                      </span>
                      <span className="text-neutral-600">
                        {[item.color, item.size].filter(Boolean).join(" / ")}
                      </span>
                      <div className="mt-1 flex items-center gap-3">
                        <label className="sr-only" htmlFor={`qty-${item.id}`}>
                          {t("quantity")}
                        </label>
                        <Input
                          id={`qty-${item.id}`}
                          type="number"
                          min={1}
                          max={20}
                          value={item.quantity}
                          disabled={isPending}
                          onChange={(event) =>
                            onQuantityChange(item.id, Number(event.target.value))
                          }
                          className="h-9 w-16"
                        />
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => onRemove(item.id)}
                          className="text-neutral-600 underline underline-offset-2 transition-colors duration-(--duration-base) hover:text-accent-600 disabled:opacity-40"
                        >
                          {t("remove")}
                        </button>
                      </div>
                    </div>
                    <span className="whitespace-nowrap font-medium text-neutral-900">
                      {formatMoney(item.lineTotalCents, cart.currency, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {cart.items.length > 0 && (
            <div className="border-t border-neutral-200 px-5 py-4">
              <div className="mb-4 flex justify-between font-display text-lg font-semibold">
                <span>{t("subtotal")}</span>
                <span>{formatMoney(cart.subtotalCents, cart.currency, locale)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={close}
                className="flex h-12 w-full items-center justify-center bg-neutral-900 font-body font-medium text-neutral-0 transition-colors duration-(--duration-base) ease-(--ease-standard) hover:bg-accent-600 active:bg-accent-700"
              >
                {t("checkout")}
              </Link>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
