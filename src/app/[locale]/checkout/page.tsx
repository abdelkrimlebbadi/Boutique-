import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCart } from "@/lib/cart/get-cart";
import { Container } from "@/components/ui/Container";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/currency/format-money";
import type { Locale } from "@/i18n/routing";

export default async function CheckoutCartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const [cart, t] = await Promise.all([
    getCart(locale as Locale),
    getTranslations("checkout.cart"),
  ]);

  return (
    <Container className="max-w-2xl py-8 lg:py-12">
      <CheckoutSteps current="cart" />
      <h1 className="mb-6 font-display text-2xl font-semibold lg:text-3xl">{t("title")}</h1>

      {cart.items.length === 0 ? (
        <div>
          <p className="mb-4 text-neutral-600">{t("empty")}</p>
          <Link
            href="/products"
            className="text-sm underline underline-offset-2 transition-colors duration-(--duration-base) hover:text-accent-600"
          >
            {t("browseCta")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <ul className="flex flex-col gap-4">
            {cart.items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between gap-4 border-b border-neutral-200 pb-4 text-sm"
              >
                <span className="text-neutral-700">
                  {item.productName}
                  {[item.color, item.size].filter(Boolean).length > 0
                    ? ` — ${[item.color, item.size].filter(Boolean).join(" / ")}`
                    : ""}{" "}
                  × {item.quantity}
                </span>
                <span className="whitespace-nowrap font-medium text-neutral-900">
                  {formatMoney(item.lineTotalCents, cart.currency, locale)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-display text-lg font-semibold">
            <span>{t("subtotal")}</span>
            <span>{formatMoney(cart.subtotalCents, cart.currency, locale)}</span>
          </div>
          <Link
            href="/checkout/address"
            className="flex h-12 w-full items-center justify-center bg-neutral-900 font-body font-medium text-neutral-0 transition-colors duration-(--duration-base) ease-(--ease-standard) hover:bg-accent-600 sm:w-auto sm:px-8"
          >
            {t("continueCta")}
          </Link>
        </div>
      )}
    </Container>
  );
}
