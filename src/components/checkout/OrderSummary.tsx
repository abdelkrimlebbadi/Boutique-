import { getTranslations } from "next-intl/server";
import { formatMoney } from "@/lib/currency/format-money";
import type { OrderPricing } from "@/lib/checkout/compute-order-pricing";
import type { Currency } from "@/lib/currency/constants";
import type { Locale } from "@/i18n/routing";

export async function OrderSummary({
  pricing,
  currency,
  locale,
}: {
  pricing: OrderPricing;
  currency: Currency;
  locale: Locale;
}) {
  const t = await getTranslations("checkout.summary");
  const money = (cents: number) => formatMoney(cents, currency, locale);

  return (
    <div className="border border-neutral-200 p-5">
      <ul className="flex flex-col gap-3 text-sm">
        {pricing.items.map((item) => (
          <li key={item.variantId} className="flex justify-between gap-4">
            <span className="text-neutral-700">
              {item.name}
              {item.variantLabel ? ` — ${item.variantLabel}` : ""} × {item.quantity}
            </span>
            <span className="whitespace-nowrap font-medium text-neutral-900">
              {money(item.lineTotalCents)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-1.5 border-t border-neutral-200 pt-4 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span>{t("subtotal")}</span>
          <span>{money(pricing.subtotalCents)}</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>{t("shipping")}</span>
          <span>{money(pricing.shippingCents)}</span>
        </div>
        {pricing.discountCents > 0 && (
          <div className="flex justify-between text-accent-600">
            <span>{t("discount")}</span>
            <span>-{money(pricing.discountCents)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between font-display text-lg font-semibold text-neutral-900">
          <span>{t("total")}</span>
          <span>{money(pricing.totalCents)}</span>
        </div>
      </div>
    </div>
  );
}
