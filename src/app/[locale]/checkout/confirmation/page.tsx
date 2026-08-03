import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { OrderStatusPoller } from "@/components/checkout/OrderStatusPoller";
import { PaymentReturnFinalizer } from "@/components/checkout/PaymentReturnFinalizer";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/currency/format-money";
import type { Currency } from "@/lib/currency/constants";
import type { Locale } from "@/i18n/routing";

const STATUS_KEYS: Record<string, string> = {
  pending: "statusPending",
  paid: "statusPaid",
  processing: "statusProcessing",
  shipped: "statusShipped",
  delivered: "statusShipped",
  failed: "statusFailed",
  cancelled: "statusFailed",
  refunded: "statusFailed",
};

export default async function CheckoutConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}) {
  const { locale } = await params;
  const { order: orderId } = await searchParams;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("checkout.confirmation");

  if (!orderId) notFound();

  const supabase = await createClient();
  // RLS-scoped: "read own orders" only ever returns this visitor's order.
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) notFound();

  const currency = order.currency as Currency;
  const statusKey = STATUS_KEYS[order.status] ?? "statusDefault";

  return (
    <Container className="max-w-2xl py-8 lg:py-12">
      <CheckoutSteps current="confirmation" />
      <h1 className="mb-2 font-display text-2xl font-semibold lg:text-3xl">{t("title")}</h1>
      <p className="mb-6 text-neutral-600">{t("orderNumber", { number: order.order_number })}</p>

      <p className="mb-2 text-sm font-medium text-neutral-900">{t(statusKey)}</p>
      {order.status === "pending" && (
        <div className="mb-6">
          <PaymentReturnFinalizer orderId={order.id} />
          <OrderStatusPoller orderId={order.id} />
        </div>
      )}
      {order.status === "failed" && (
        <Link
          href="/checkout/payment"
          className="mb-6 inline-block text-sm underline underline-offset-2 transition-colors duration-(--duration-base) hover:text-accent-600"
        >
          {t("retryPayment")}
        </Link>
      )}

      <div className="mt-4 border border-neutral-200 p-5">
        <ul className="flex flex-col gap-3 text-sm">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span className="text-neutral-700">
                {item.name}
                {item.variant_label ? ` — ${item.variant_label}` : ""} × {item.quantity}
              </span>
              <span className="whitespace-nowrap font-medium text-neutral-900">
                {formatMoney(item.line_total_cents, currency, locale)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-col gap-1.5 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex justify-between text-neutral-600">
            <span>{t("subtotal")}</span>
            <span>{formatMoney(order.subtotal_cents, currency, locale)}</span>
          </div>
          <div className="flex justify-between text-neutral-600">
            <span>{t("shipping")}</span>
            <span>{formatMoney(order.shipping_cents, currency, locale)}</span>
          </div>
          {order.discount_cents > 0 && (
            <div className="flex justify-between text-accent-600">
              <span>{t("discount")}</span>
              <span>-{formatMoney(order.discount_cents, currency, locale)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between font-display text-lg font-semibold text-neutral-900">
            <span>{t("total")}</span>
            <span>{formatMoney(order.total_cents, currency, locale)}</span>
          </div>
        </div>
      </div>

      <Link
        href="/products"
        className="mt-8 inline-block text-sm underline underline-offset-2 transition-colors duration-(--duration-base) hover:text-accent-600"
      >
        {t("backToShop")}
      </Link>
    </Container>
  );
}
