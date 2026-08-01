import "server-only";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { sendShippingNotificationEmail } from "@/lib/resend/send-shipping-notification";
import { getOrderLocale } from "@/lib/checkout/get-order-locale";

// Printful's `package_shipped` webhook shape — confidence: moderate (this
// is Printful's long-stable event shape) but not independently verified
// against live docs in this environment. Isolated here, like YouCan Pay,
// so it can be corrected in one place without touching the payment
// abstraction or the route handler.
const shipmentEventSchema = z.object({
  type: z.string(),
  data: z.object({
    order: z.object({ id: z.union([z.string(), z.number()]) }),
    shipment: z.object({
      tracking_number: z.string(),
      tracking_url: z.string(),
      carrier: z.string().nullable().optional(),
    }),
  }),
});

export async function handlePrintfulShipmentWebhook(rawBody: string): Promise<void> {
  const parsed = shipmentEventSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success || parsed.data.type !== "package_shipped") return;

  const { order, shipment } = parsed.data.data;
  const printfulOrderId = String(order.id);

  const supabase = createServiceRoleClient();
  const { data: dbOrder } = await supabase
    .from("orders")
    .select("*")
    .eq("printful_order_id", printfulOrderId)
    .maybeSingle();

  if (!dbOrder) {
    console.error(
      `handlePrintfulShipmentWebhook: no order for printful_order_id ${printfulOrderId}`
    );
    return;
  }
  // Idempotent no-op: already applied (replay or duplicate webhook).
  if (dbOrder.status === "shipped" || dbOrder.status === "delivered") return;

  const { error } = await supabase
    .from("orders")
    .update({
      status: "shipped",
      tracking_number: shipment.tracking_number,
      tracking_url: shipment.tracking_url,
      carrier: shipment.carrier ?? null,
    })
    .eq("id", dbOrder.id);
  if (error) {
    throw new Error(`Failed to mark order ${dbOrder.id} shipped: ${error.message}`);
  }

  try {
    const locale = await getOrderLocale(supabase, dbOrder.customer_id);
    await sendShippingNotificationEmail(dbOrder.contact_email, {
      locale,
      orderNumber: dbOrder.order_number,
      trackingNumber: shipment.tracking_number,
      trackingUrl: shipment.tracking_url,
      carrier: shipment.carrier ?? null,
    });
  } catch (error) {
    console.error(`handlePrintfulShipmentWebhook: email failed for ${dbOrder.id}:`, error);
  }
}
