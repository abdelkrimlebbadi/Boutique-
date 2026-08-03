import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveCartId } from "@/lib/cart/resolve-cart-id";
import { computeOrderPricing } from "@/lib/checkout/compute-order-pricing";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { getCheckoutAddressIds } from "@/lib/checkout/checkout-cookies";
import { Container } from "@/components/ui/Container";
import { CheckoutSteps } from "@/components/checkout/CheckoutSteps";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export default async function CheckoutShippingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);
  const t = await getTranslations("checkout.shipping");

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
  const pricing = await computeOrderPricing({
    // Display-only running total — the design isn't finalized yet at this
    // step (that happens on the payment page, right before "Payer"), and
    // pricing never depends on whether a design is attached, so the
    // MISSING_DESIGN guard doesn't apply here.
    cartItems: cartItemRows.map((row) => ({
      variantId: row.variant_id,
      quantity: row.quantity,
      hasCustomDesign: false,
      customDesignPrintFileUrl: null,
    })),
    currency,
    countryCode: shippingAddressRow.country_code,
    locale: locale as Locale,
    discountCode: null,
  });

  return (
    <Container className="max-w-2xl py-8 lg:py-12">
      <CheckoutSteps current="shipping" />
      <h1 className="mb-6 font-display text-2xl font-semibold lg:text-3xl">{t("title")}</h1>

      {!pricing.ok ? (
        <p className="text-sm text-red-600">{t("noRate")}</p>
      ) : (
        <div className="flex flex-col gap-8">
          <OrderSummary pricing={pricing.pricing} currency={currency} locale={locale as Locale} />
          <Link
            href="/checkout/payment"
            className="flex h-12 w-full items-center justify-center bg-neutral-900 font-body font-medium text-neutral-0 transition-colors duration-(--duration-base) ease-(--ease-standard) hover:bg-accent-600 sm:w-auto sm:px-8"
          >
            {t("continueCta")}
          </Link>
        </div>
      )}
    </Container>
  );
}
