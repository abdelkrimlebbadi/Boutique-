import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
  searchParams: Promise<{ error?: string; cancelled?: string }>;
}) {
  const { locale } = await params;
  const { error, cancelled } = await searchParams;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("checkout.payment");

  const supabase = await createClient();
  const cartId = await resolveActiveCartId(supabase);
  if (!cartId) redirect(`/${locale}/checkout`);

  const { data: cartItemRows } = await supabase
    .from("cart_items")
    .select("variant_id, quantity")
    .eq("cart_id", cartId);
  if (!cartItemRows || cartItemRows.length === 0) redirect(`/${locale}/checkout`);

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

  const errorKey =
    error && error in ERROR_KEYS ? ERROR_KEYS[error as keyof typeof ERROR_KEYS] : null;

  return (
    <Container className="max-w-2xl py-8 lg:py-12">
      <CheckoutSteps current="payment" />
      <h1 className="mb-6 font-display text-2xl font-semibold lg:text-3xl">{t("title")}</h1>

      {!pricing.ok ? (
        <p className="text-sm text-red-600">{t("errorGeneric")}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {cancelled && <p className="text-sm text-neutral-600">{t("cancelled")}</p>}
          {errorKey && <p className="text-sm text-red-600">{t(errorKey)}</p>}

          <DiscountCodeForm appliedCode={discountCode} />
          <OrderSummary pricing={pricing.pricing} currency={currency} locale={locale as Locale} />
          <PaymentButton locale={locale as Locale} />
        </div>
      )}
    </Container>
  );
}
