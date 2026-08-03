import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveCartId } from "@/lib/cart/resolve-cart-id";
import { computeOrderPricing } from "@/lib/checkout/compute-order-pricing";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { getCheckoutAddressIds, getCheckoutDiscountCode } from "@/lib/checkout/checkout-cookies";
import { Container } from "@/components/ui/Container";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { DiscountCodeForm } from "@/components/checkout/DiscountCodeForm";
import { PaymentButton } from "@/components/checkout/PaymentButton";
import type { Locale } from "@/i18n/routing";

const ERROR_KEYS = {
  EMPTY_CART: "errorGeneric",
  MISSING_PRICE: "errorMissingPrice",
  NO_SHIPPING_RATE: "errorNoShipping",
  INVALID_DISCOUNT_CODE: "errorInvalidDiscount",
  ORDER_CREATION_FAILED: "errorOrderCreation",
  PAYMENT_SESSION_FAILED: "errorPaymentSession",
} as const;

export default async function CheckoutPaymentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string; cancelled?: string; detail?: string }>;
}) {
  const { locale } = await params;
  const { error, cancelled, detail } = await searchParams;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("checkout.payment");
  const tCart = await getTranslations("checkout.cart");

  const errorKey =
    error && error in ERROR_KEYS ? ERROR_KEYS[error as keyof typeof ERROR_KEYS] : null;

  const supabase = await createClient();
  const cartId = await resolveActiveCartId(supabase);
  const { data: cartItemRows } = cartId
    ? await supabase.from("cart_items").select("variant_id, quantity").eq("cart_id", cartId)
    : { data: null };

  // A failed payment normally hands the cart back (see
  // releaseCartAfterFailedPayment), so this page can show the error with the
  // order still intact. If that restore couldn't happen, showing the error on
  // its own is still far better than silently bouncing to an empty cart.
  if (!cartId || !cartItemRows || cartItemRows.length === 0) {
    if (!errorKey) redirect(`/${locale}/checkout`);
    return (
      <Container className="max-w-2xl py-8 lg:py-12">
        <CheckoutSteps current="payment" />
        <h1 className="mb-6 font-display text-2xl font-semibold lg:text-3xl">{t("title")}</h1>
        <p className="mb-2 text-sm text-red-600">{t(errorKey)}</p>
        {detail && <p className="mb-6 text-xs text-red-400">{detail}</p>}
        <Link
          href="/products"
          className="text-sm underline underline-offset-2 transition-colors duration-(--duration-base) hover:text-accent-600"
        >
          {tCart("browseCta")}
        </Link>
      </Container>
    );
  }

  const { shippingAddressId } = await getCheckoutAddressIds();
  if (!shippingAddressId) redirect(`/${locale}/checkout/address`);

  const { data: shippingAddressRow } = await supabase
    .from("addresses")
    .select("country_code")
    .eq("id", shippingAddressId)
    .maybeSingle();
  if (!shippingAddressRow) redirect(`/${locale}/checkout/address`);

  const currency = await getPreferredCurrency();
  const discountCode = await getCheckoutDiscountCode();

  const pricing = await computeOrderPricing({
    cartItems: cartItemRows.map((row) => ({ variantId: row.variant_id, quantity: row.quantity })),
    currency,
    countryCode: shippingAddressRow.country_code,
    locale: locale as Locale,
    discountCode,
  });

  return (
    <Container className="max-w-2xl py-8 lg:py-12">
      <CheckoutSteps current="payment" />
      <h1 className="mb-6 font-display text-2xl font-semibold lg:text-3xl">{t("title")}</h1>

      {!pricing.ok ? (
        <p className="text-sm text-red-600">{t("errorGeneric")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {cancelled && <p className="text-sm text-neutral-600">{t("cancelled")}</p>}
          {errorKey && (
            <div>
              <p className="text-sm text-red-600">{t(errorKey)}</p>
              {detail && <p className="text-xs text-red-400">{detail}</p>}
            </div>
          )}

          <DiscountCodeForm appliedCode={discountCode} />
          <OrderSummary pricing={pricing.pricing} currency={currency} locale={locale as Locale} />
          <PaymentButton locale={locale as Locale} />
        </div>
      )}
    </Container>
  );
}
