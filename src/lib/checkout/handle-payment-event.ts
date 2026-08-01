import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createPrintfulOrder } from "@/lib/printful/create-order";
import { sendOrderConfirmationEmail } from "@/lib/resend/send-order-confirmation";
import { sendPaymentFailedEmail } from "@/lib/resend/send-payment-failed";
import { addressSchema } from "@/lib/validation/address";
import { getOrderLocale } from "./get-order-locale";
import { SITE_URL } from "@/lib/seo/site";
import type { VerifiedEvent, PaymentProviderName } from "@/lib/payments/types";
import type { Currency } from "@/lib/currency/constants";

export async function handlePaymentSucceeded(
  event: Extract<VerifiedEvent, { kind: "payment_succeeded" }>,
  providerName: PaymentProviderName
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", event.orderId)
    .maybeSingle();

  if (!order) {
    console.error(`handlePaymentSucceeded: order ${event.orderId} not found`);
    return;
  }
  if (order.payment_provider !== providerName) {
    console.error(
      `handlePaymentSucceeded: order ${order.id} belongs to ${order.payment_provider}, got webhook from ${providerName}`
    );
    return;
  }
  if (order.status !== "pending") {
    // Already processed (replay) or in a state this event no longer
    // applies to — a no-op, not an error.
    return;
  }

  // Critical write: must succeed or the request should fail so the
  // provider retries the webhook.
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "paid", payment_ref: event.paymentRef })
    .eq("id", order.id)
    .eq("status", "pending");
  if (updateError) throw new Error(`Failed to mark order ${order.id} paid: ${updateError.message}`);

  // Everything from here is best-effort: the customer has paid, nothing
  // below should make this webhook request fail and be retried.
  try {
    const { data: items } = await supabase
      .from("order_items")
      .select("printful_variant_id, quantity, unit_price_cents, name")
      .eq("order_id", order.id);

    const shippingAddress = addressSchema.parse(order.shipping_address);
    const missingVariant = items?.find((item) => !item.printful_variant_id);
    if (missingVariant) {
      console.error(
        `handlePaymentSucceeded: order ${order.id} has a line item with no printful_variant_id (${missingVariant.name}), skipping Printful order creation`
      );
    } else if (items && items.length > 0) {
      const { printfulOrderId } = await createPrintfulOrder({
        externalOrderNumber: order.order_number,
        contactEmail: order.contact_email,
        recipient: shippingAddress,
        items: items.map((item) => ({
          printfulVariantId: item.printful_variant_id!,
          quantity: item.quantity,
          retailPriceCents: item.unit_price_cents,
          currency: order.currency,
        })),
      });

      await supabase
        .from("orders")
        .update({ printful_order_id: printfulOrderId, status: "processing" })
        .eq("id", order.id);
    }
  } catch (error) {
    console.error(`handlePaymentSucceeded: Printful order creation failed for ${order.id}:`, error);
  }

  try {
    const { data: items } = await supabase
      .from("order_items")
      .select("name, variant_label, quantity, line_total_cents")
      .eq("order_id", order.id);

    const locale = await getOrderLocale(supabase, order.customer_id);
    const shippingAddress = addressSchema.parse(order.shipping_address);

    await sendOrderConfirmationEmail(order.contact_email, {
      locale,
      orderNumber: order.order_number,
      currency: order.currency as Currency,
      items: (items ?? []).map((item) => ({
        name: item.name,
        variantLabel: item.variant_label,
        quantity: item.quantity,
        lineTotalCents: item.line_total_cents,
      })),
      subtotalCents: order.subtotal_cents,
      shippingCents: order.shipping_cents,
      discountCents: order.discount_cents,
      totalCents: order.total_cents,
      shippingAddress,
    });
  } catch (error) {
    console.error(`handlePaymentSucceeded: confirmation email failed for ${order.id}:`, error);
  }
}

export async function handlePaymentFailed(
  event: Extract<VerifiedEvent, { kind: "payment_failed" }>,
  providerName: PaymentProviderName
): Promise<void> {
  const supabase = createServiceRoleClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", event.orderId)
    .maybeSingle();

  if (!order) {
    console.error(`handlePaymentFailed: order ${event.orderId} not found`);
    return;
  }
  if (order.payment_provider !== providerName) {
    console.error(
      `handlePaymentFailed: order ${order.id} belongs to ${order.payment_provider}, got webhook from ${providerName}`
    );
    return;
  }
  if (order.status !== "pending") return;

  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: "failed" })
    .eq("id", order.id)
    .eq("status", "pending");
  if (updateError) throw new Error(`Failed to mark order ${order.id} failed: ${updateError.message}`);

  try {
    const locale = await getOrderLocale(supabase, order.customer_id);
    await sendPaymentFailedEmail(order.contact_email, {
      locale,
      orderNumber: order.order_number,
      retryUrl: `${SITE_URL}/${locale}/checkout/payment?order=${order.id}`,
    });
  } catch (error) {
    console.error(`handlePaymentFailed: email failed for ${order.id}:`, error);
  }
}
