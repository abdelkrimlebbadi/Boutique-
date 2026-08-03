"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { resolveActiveCartId } from "@/lib/cart/resolve-cart-id";
import { computeOrderPricing } from "@/lib/checkout/compute-order-pricing";
import { processPaymentWebhook } from "@/lib/checkout/process-payment-webhook";
import { handlePaymentSucceeded } from "@/lib/checkout/handle-payment-event";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { getPaymentProviderByName, getPaymentProviderName } from "@/lib/payments/select-provider";
import { addressSchema, type AddressInput } from "@/lib/validation/address";
import {
  getCheckoutAddressIds,
  setCheckoutAddressIds,
  getCheckoutDiscountCode,
  setCheckoutDiscountCode,
  getCheckoutContactEmail,
  setCheckoutContactEmail,
  clearCheckoutCookies,
} from "@/lib/checkout/checkout-cookies";
import { locales, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/site";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { CreateSessionResult } from "@/lib/payments/types";

const localeSchema = z.enum(locales);

// ---------------------------------------------------------------------------
// Address
// ---------------------------------------------------------------------------

const saveCheckoutAddressSchema = z
  .object({
    contactEmail: z.string().trim().email().max(200),
    locale: localeSchema,
    shipping: addressSchema,
    billingSameAsShipping: z.boolean(),
    billing: addressSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.billingSameAsShipping && !value.billing) {
      ctx.addIssue({
        code: "custom",
        path: ["billing"],
        message: "Billing address required when different from shipping",
      });
    }
  });

export type SaveCheckoutAddressInput = z.input<typeof saveCheckoutAddressSchema>;

type AnonClient = Awaited<ReturnType<typeof createClient>>;

async function upsertAddress(
  supabase: AnonClient,
  customerId: string,
  existingId: string | null,
  input: AddressInput
): Promise<string> {
  const row = {
    customer_id: customerId,
    full_name: input.fullName,
    line1: input.line1,
    line2: input.line2 ?? null,
    city: input.city,
    state: input.state ?? null,
    postal_code: input.postalCode,
    country_code: input.countryCode,
    phone: input.phone ?? null,
  };

  if (existingId) {
    const { data: existing } = await supabase
      .from("addresses")
      .select("id")
      .eq("id", existingId)
      .eq("customer_id", customerId)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase.from("addresses").update(row).eq("id", existingId);
      if (error) throw new Error(error.message);
      return existingId;
    }
  }

  const { data, error } = await supabase.from("addresses").insert(row).select("id").single();
  if (error || !data) throw new Error(error?.message ?? "Failed to save address");
  return data.id;
}

export async function saveCheckoutAddress(rawInput: SaveCheckoutAddressInput): Promise<void> {
  const input = saveCheckoutAddressSchema.parse(rawInput);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No active session");

  const { shippingAddressId: existingShippingId, billingAddressId: existingBillingId } =
    await getCheckoutAddressIds();

  const shippingAddressId = await upsertAddress(
    supabase,
    user.id,
    existingShippingId,
    input.shipping
  );
  const billingAddressId = input.billingSameAsShipping
    ? null
    : await upsertAddress(supabase, user.id, existingBillingId, input.billing!);

  await setCheckoutAddressIds({ shippingAddressId, billingAddressId });
  await setCheckoutContactEmail(input.contactEmail);
  // Best-effort: lets later transactional emails (sent from webhook
  // handlers, outside next-intl's request scope) pick the right language.
  await supabase.from("customers").update({ preferred_locale: input.locale }).eq("id", user.id);

  redirect(`/${input.locale}/checkout/shipping`);
}

// ---------------------------------------------------------------------------
// Discount code
// ---------------------------------------------------------------------------

const discountCodeSchema = z.object({ code: z.string().trim().min(1).max(40) });

export async function applyDiscountCode(
  rawInput: z.input<typeof discountCodeSchema>
): Promise<{ ok: true } | { ok: false; error: "INVALID_CODE" }> {
  const { code } = discountCodeSchema.parse(rawInput);
  const supabase = await createClient();

  const { data: validation } = await supabase
    .rpc("validate_discount_code", { p_code: code })
    .maybeSingle();

  if (!validation?.valid) {
    return { ok: false, error: "INVALID_CODE" };
  }

  await setCheckoutDiscountCode(code);
  return { ok: true };
}

export async function removeDiscountCode(): Promise<void> {
  await setCheckoutDiscountCode(null);
}

// ---------------------------------------------------------------------------
// Order status (confirmation page polling)
// ---------------------------------------------------------------------------

const orderIdSchema = z.string().uuid();

export async function getOrderStatus(
  rawOrderId: string
): Promise<Database["public"]["Enums"]["order_status"] | null> {
  const orderId = orderIdSchema.parse(rawOrderId);
  const supabase = await createClient();

  const { data } = await supabase.from("orders").select("status").eq("id", orderId).maybeSingle();
  return data?.status ?? null;
}

// Called when the customer lands back from a provider whose approval step
// doesn't settle the payment (PayPal — see PaymentProvider.captureOnReturn).
// The matching webhook would also settle the order, but only eventually and
// only if webhook delivery is healthy; capturing here is what actually
// charges the customer, so it can't be left to that.
export async function finalizePaymentReturn(rawOrderId: string): Promise<void> {
  const orderId = orderIdSchema.parse(rawOrderId);

  // RLS-scoped read first: "read own orders" means a visitor can only ever
  // finalise an order that is genuinely theirs.
  const supabase = await createClient();
  const { data: ownOrder } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();
  if (!ownOrder) return;

  const serviceRole = createServiceRoleClient();
  const { data: order } = await serviceRole
    .from("orders")
    .select("id, status, payment_provider, payment_ref")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.status !== "pending" || !order.payment_ref) return;

  const provider = getPaymentProviderByName(order.payment_provider);
  if (!provider.captureOnReturn) return;

  const capture = await provider.captureOnReturn(order.payment_ref);
  if (!capture) return;

  // Idempotent on `status = 'pending'`, so the webhook arriving later for
  // the same capture is a no-op rather than a double-processing.
  await handlePaymentSucceeded(
    {
      kind: "payment_succeeded",
      orderId: order.id,
      externalId: capture.paymentRef,
      paymentRef: capture.paymentRef,
      amountCents: capture.amountCents,
      currency: capture.currency,
    },
    order.payment_provider
  );
}

// ---------------------------------------------------------------------------
// startPayment — the checkout tunnel's critical path. Recomputes the order
// total from scratch (never trusts anything cached from an earlier step),
// creates the `orders` row atomically, then hands off to whichever
// PaymentProvider applies for the shipping country.
// ---------------------------------------------------------------------------

type AddressRow = Database["public"]["Tables"]["addresses"]["Row"];

function toAddressSnapshot(row: AddressRow): AddressInput {
  return {
    fullName: row.full_name,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    countryCode: row.country_code,
    phone: row.phone,
  };
}

const startPaymentSchema = z.object({ locale: localeSchema });

export async function startPayment(rawInput: { locale: string }): Promise<void> {
  const { locale } = startPaymentSchema.parse(rawInput);
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/checkout`);

  const cartId = await resolveActiveCartId(supabase);
  if (!cartId) redirect(`/${locale}/checkout`);

  const { data: cartItemRows } = await supabase
    .from("cart_items")
    .select("variant_id, quantity, custom_design_state, custom_design_print_file_url")
    .eq("cart_id", cartId);
  if (!cartItemRows || cartItemRows.length === 0) redirect(`/${locale}/checkout`);

  const { shippingAddressId, billingAddressId } = await getCheckoutAddressIds();
  const contactEmail = await getCheckoutContactEmail();
  if (!shippingAddressId || !contactEmail) redirect(`/${locale}/checkout/address`);

  const { data: shippingAddressRow } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", shippingAddressId)
    .maybeSingle();
  if (!shippingAddressRow) redirect(`/${locale}/checkout/address`);

  const billingAddressRow = billingAddressId
    ? (await supabase.from("addresses").select("*").eq("id", billingAddressId).maybeSingle()).data
    : null;

  const currency = await getPreferredCurrency();
  const discountCode = await getCheckoutDiscountCode();

  const pricing = await computeOrderPricing({
    cartItems: cartItemRows.map((row) => ({
      variantId: row.variant_id,
      quantity: row.quantity,
      hasCustomDesign: row.custom_design_state !== null,
      customDesignPrintFileUrl: row.custom_design_print_file_url,
    })),
    currency,
    countryCode: shippingAddressRow.country_code,
    locale: locale as Locale,
    discountCode,
  });
  if (!pricing.ok) redirect(`/${locale}/checkout/payment?error=${pricing.error}`);

  const shippingAddress = toAddressSnapshot(shippingAddressRow);
  const billingAddress = billingAddressRow ? toAddressSnapshot(billingAddressRow) : null;
  const providerName = getPaymentProviderName(shippingAddressRow.country_code);

  const serviceRole: SupabaseClient<Database> = createServiceRoleClient();
  const { data: order, error: createOrderError } = await serviceRole.rpc(
    "create_order_with_items",
    {
      p_customer_id: user.id,
      p_cart_id: cartId,
      p_contact_email: contactEmail,
      // Supabase's generated RPC Args types aren't nullable-aware for plain
      // function parameters (Postgres doesn't expose that metadata) even
      // though the SQL column/param genuinely accepts null.
      p_contact_phone: shippingAddressRow.phone as string,
      p_currency: currency,
      p_subtotal_cents: pricing.pricing.subtotalCents,
      p_shipping_cents: pricing.pricing.shippingCents,
      p_tax_cents: pricing.pricing.taxCents,
      p_discount_cents: pricing.pricing.discountCents,
      p_total_cents: pricing.pricing.totalCents,
      p_discount_code_id: pricing.pricing.discountCodeId as string,
      p_shipping_address: shippingAddress,
      p_billing_address: billingAddress,
      p_payment_provider: providerName,
      p_items: pricing.pricing.items.map((item) => ({
        variant_id: item.variantId,
        product_id: item.productId,
        printful_variant_id: item.printfulVariantId,
        sku: item.sku,
        name: item.name,
        variant_label: item.variantLabel,
        image_url: item.imageUrl,
        unit_price_cents: item.unitPriceCents,
        quantity: item.quantity,
        line_total_cents: item.lineTotalCents,
        custom_design_url: item.customDesignPrintFileUrl,
      })),
    }
  );
  if (createOrderError || !order) {
    console.error("create_order_with_items failed:", createOrderError);
    redirect(`/${locale}/checkout/payment?error=ORDER_CREATION_FAILED`);
  }

  let session: CreateSessionResult;
  try {
    session = await getPaymentProviderByName(providerName).createSession({
      orderId: order.id,
      orderNumber: order.order_number,
      totalCents: order.total_cents,
      currency,
      contactEmail,
      locale: locale as Locale,
      returnUrl: `${SITE_URL}/${locale}/checkout/confirmation?order=${order.id}`,
      cancelUrl: `${SITE_URL}/${locale}/checkout/payment?cancelled=1`,
    });
  } catch (error) {
    console.error("createSession failed:", error);
    await releaseCartAfterFailedPayment(serviceRole, order.id, cartId);
    redirect(`/${locale}/checkout/payment?error=PAYMENT_SESSION_FAILED`);
  }

  await serviceRole.from("orders").update({ payment_ref: session.externalId }).eq("id", order.id);
  await clearCheckoutCookies();

  // Outside the try/catch above: redirect() throws an internal NEXT_REDIRECT
  // exception that a surrounding catch must never swallow.
  redirect(session.redirectUrl);
}

// create_order_with_items already flipped the cart to `converted`, so a
// provider that fails to open a session would otherwise strand the customer:
// the payment page finds no active cart and bounces them to an empty one,
// with the PAYMENT_SESSION_FAILED message never rendered and their items
// gone. Nothing was charged, so hand the cart back and close the order.
// Best-effort by design — the redirect must happen either way, and a
// customer seeing the error still beats one seeing an empty cart.
async function releaseCartAfterFailedPayment(
  serviceRole: SupabaseClient<Database>,
  orderId: string,
  cartId: string
): Promise<void> {
  const { error: orderError } = await serviceRole
    .from("orders")
    .update({ status: "failed" })
    .eq("id", orderId)
    .eq("status", "pending");
  if (orderError) {
    console.error(`Failed to close order ${orderId} after payment session failure:`, orderError);
  }

  // Guarded on `converted`: if the customer already started a new cart in
  // another tab, restoring this one would violate
  // carts_one_active_per_customer — theirs wins, this is a no-op.
  const { error: cartError } = await serviceRole
    .from("carts")
    .update({ status: "active" })
    .eq("id", cartId)
    .eq("status", "converted");
  if (cartError) {
    console.error(`Failed to restore cart ${cartId} after payment session failure:`, cartError);
  }
}

// ---------------------------------------------------------------------------
// Mock payment simulation (local dev / demo only). Goes through the exact
// same HTTP + signature-verification + idempotence path a real provider's
// webhook would, rather than marking anything paid directly — see
// MockProvider in src/lib/payments/mock-provider.ts.
// ---------------------------------------------------------------------------

const simulateMockPaymentSchema = z.object({
  orderId: z.string().uuid(),
  externalId: z.string().min(1),
  amountCents: z.number().int().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  outcome: z.enum(["success", "failure"]),
  locale: localeSchema,
});

export async function simulateMockPayment(
  rawInput: z.input<typeof simulateMockPaymentSchema>
): Promise<void> {
  if (process.env.PAYMENT_PROVIDER !== "mock") {
    throw new Error("Mock payment simulation is disabled (PAYMENT_PROVIDER != mock)");
  }
  const input = simulateMockPaymentSchema.parse(rawInput);
  const secret = process.env.MOCK_WEBHOOK_SECRET;
  if (!secret) throw new Error("MOCK_WEBHOOK_SECRET not configured");

  const { createHmac } = await import("node:crypto");
  const payload = JSON.stringify({
    orderId: input.orderId,
    externalId: input.externalId,
    outcome: input.outcome,
    amountCents: input.amountCents,
    currency: input.currency,
  });
  const signature = createHmac("sha256", secret).update(payload).digest("hex");

  // Called in-process rather than POSTed to /api/webhooks/mock: a Worker
  // cannot fetch its own hostname (Cloudflare error 1042). The payload is
  // still signed and goes through the same verification, idempotence and
  // processing path a real provider's webhook takes.
  const result = await processPaymentWebhook({
    rawBody: payload,
    headers: new Headers({
      "content-type": "application/json",
      "x-mock-signature": signature,
    }),
    providerName: "mock",
  });
  if (!result.ok) {
    throw new Error(`Mock webhook processing failed: ${result.status} ${result.error}`);
  }

  redirect(`/${input.locale}/checkout/confirmation?order=${input.orderId}`);
}
