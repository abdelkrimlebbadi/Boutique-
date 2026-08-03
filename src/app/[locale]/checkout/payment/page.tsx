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
import { PaymentSection } from "@/components/checkout/PaymentSection";
import type { PendingDesign } from "@/components/checkout/DesignCompositor";
import { designStateSchema } from "@/lib/validation/custom-design";
import type { Locale } from "@/i18n/routing";

const ERROR_KEYS = {
  EMPTY_CART: "errorGeneric",
  MISSING_PRICE: "errorMissingPrice",
  NO_SHIPPING_RATE: "errorNoShipping",
  INVALID_DISCOUNT_CODE: "errorInvalidDiscount",
  ORDER_CREATION_FAILED: "errorOrderCreation",
  PAYMENT_SESSION_FAILED: "errorPaymentSession",
  MISSING_DESIGN: "errorMissingDesign",
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
  const tCart = await getTranslations("checkout.cart");

  const errorKey =
    error && error in ERROR_KEYS ? ERROR_KEYS[error as keyof typeof ERROR_KEYS] : null;

  const supabase = await createClient();
  const cartId = await resolveActiveCartId(supabase);
  const { data: cartItemRows } = cartId
    ? await supabase
        .from("cart_items")
        .select(
          `id, variant_id, quantity, custom_design_state, custom_design_print_file_url,
           product_variants ( print_area_width_px, print_area_height_px, print_area_dpi )`
        )
        .eq("cart_id", cartId)
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
        <p className="mb-6 text-sm text-red-600">{t(errorKey)}</p>
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
    // Display-only running total for this page's OrderSummary — the design
    // may not be finalized yet at first render (that's exactly what
    // DesignCompositor below is about to do), so MISSING_DESIGN must not
    // block rendering here. startPayment (triggered only once
    // DesignCompositor reports ready) is the actual enforcement point.
    cartItems: cartItemRows.map((row) => ({
      variantId: row.variant_id,
      quantity: row.quantity,
      hasCustomDesign: false,
      customDesignPrintFileUrl: null,
    })),
    currency,
    countryCode: shippingAddressRow.country_code,
    locale: locale as Locale,
    discountCode,
  });

  // Cart lines with a design that hasn't been flattened into a print file
  // yet — DesignCompositor produces custom_design_print_file_url for each
  // of these before PaymentButton unlocks. A line configured without a
  // valid print area or with malformed state is skipped here rather than
  // fabricated; compute-order-pricing's MISSING_DESIGN check is the real
  // gate that blocks startPayment if one still lacks a print file.
  const pendingDesigns: PendingDesign[] = [];
  for (const row of cartItemRows) {
    if (!row.custom_design_state || row.custom_design_print_file_url) continue;
    const variant = row.product_variants;
    if (!variant?.print_area_width_px || !variant.print_area_height_px || !variant.print_area_dpi) {
      continue;
    }
    const parsedState = designStateSchema.safeParse(row.custom_design_state);
    if (!parsedState.success) continue;
    pendingDesigns.push({
      cartItemId: row.id,
      state: parsedState.data,
      printArea: {
        widthPx: variant.print_area_width_px,
        heightPx: variant.print_area_height_px,
        dpi: variant.print_area_dpi,
      },
    });
  }

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
          <PaymentSection locale={locale as Locale} pendingDesigns={pendingDesigns} />
        </div>
      )}
    </Container>
  );
}
