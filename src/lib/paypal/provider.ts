import "server-only";
import { z } from "zod";
import { paypalFetch } from "./client";
import { WebhookVerificationError } from "@/lib/payments/verify-hmac";
import type {
  CaptureResult,
  CreateSessionInput,
  CreateSessionResult,
  PaymentProvider,
  VerifiedEvent,
  VerifyWebhookInput,
} from "@/lib/payments/types";

type PayPalOrderResponse = {
  id: string;
  links: { rel: string; href: string }[];
};

type PayPalCaptureResponse = {
  id: string;
  amount?: { currency_code: string };
};

type PayPalCaptureOrderResponse = {
  id: string;
  purchase_units?: {
    payments?: {
      captures?: { id: string; amount: { currency_code: string; value: string } }[];
    };
  }[];
};

const webhookEventSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  resource: z
    .object({
      id: z.string().optional(),
      custom_id: z.string().optional(),
      amount: z
        .object({
          value: z.string().optional(),
          currency_code: z.string().optional(),
        })
        .optional(),
      purchase_units: z
        .array(z.object({ custom_id: z.string().optional() }))
        .optional(),
    })
    .passthrough(),
});

// PayPal echoes the field we set at order-creation time on every related
// resource, which is how the webhook recovers our orderId without a
// separate lookup table.
function extractOrderId(resource: z.infer<typeof webhookEventSchema>["resource"]): string | null {
  return resource.custom_id ?? resource.purchase_units?.[0]?.custom_id ?? null;
}

export class PayPalProvider implements PaymentProvider {
  async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const order = await paypalFetch<PayPalOrderResponse>("/v2/checkout/orders", {
      method: "POST",
      body: {
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: input.orderId,
            custom_id: input.orderId,
            invoice_id: input.orderNumber,
            amount: {
              currency_code: input.currency,
              value: (input.totalCents / 100).toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: input.returnUrl,
          cancel_url: input.cancelUrl,
          user_action: "PAY_NOW",
        },
      },
    });

    const approveLink = order.links.find((link) => link.rel === "approve");
    if (!approveLink) {
      throw new Error(`PayPal order ${order.id} has no approve link`);
    }

    return { redirectUrl: approveLink.href, externalId: order.id };
  }

  // Approving a PayPal order does not move any money: with intent CAPTURE
  // the buyer's approval only authorises it, and nothing is charged — nor
  // is any PAYMENT.CAPTURE.* webhook emitted — until this call. Without it
  // an order would sit `pending` forever after an apparently successful
  // checkout.
  async captureOnReturn(externalId: string): Promise<CaptureResult | null> {
    let response: PayPalCaptureOrderResponse;
    try {
      response = await paypalFetch<PayPalCaptureOrderResponse>(
        `/v2/checkout/orders/${externalId}/capture`,
        { method: "POST", body: {} }
      );
    } catch (error) {
      // Already captured — the customer reloaded the return URL, or opened
      // it twice. The payment stands; leave it to the webhook/poller.
      if (error instanceof Error && error.message.includes("ORDER_ALREADY_CAPTURED")) {
        return null;
      }
      throw error;
    }

    const capture = response.purchase_units?.[0]?.payments?.captures?.[0];
    if (!capture) return null;

    return {
      paymentRef: capture.id,
      amountCents: Math.round(parseFloat(capture.amount.value) * 100),
      currency: capture.amount.currency_code,
    };
  }

  async verifyWebhook(input: VerifyWebhookInput): Promise<VerifiedEvent> {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) throw new WebhookVerificationError("PAYPAL_WEBHOOK_ID not configured");

    const webhookEvent: unknown = JSON.parse(input.rawBody);

    const verification = await paypalFetch<{ verification_status: string }>(
      "/v1/notifications/verify-webhook-signature",
      {
        method: "POST",
        body: {
          transmission_id: input.headers.get("paypal-transmission-id"),
          transmission_time: input.headers.get("paypal-transmission-time"),
          cert_url: input.headers.get("paypal-cert-url"),
          auth_algo: input.headers.get("paypal-auth-algo"),
          transmission_sig: input.headers.get("paypal-transmission-sig"),
          webhook_id: webhookId,
          webhook_event: webhookEvent,
        },
      }
    );

    if (verification.verification_status !== "SUCCESS") {
      throw new WebhookVerificationError("PayPal webhook signature verification failed");
    }

    const parsed = webhookEventSchema.safeParse(webhookEvent);
    if (!parsed.success) throw new WebhookVerificationError("unexpected PayPal webhook payload");
    const event = parsed.data;
    const orderId = extractOrderId(event.resource);

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      if (!orderId || !event.resource.id) return { kind: "ignored" };
      const amount = event.resource.amount;
      return {
        kind: "payment_succeeded",
        orderId,
        externalId: event.id,
        paymentRef: event.resource.id, // capture id — this is what's refundable
        amountCents: amount?.value ? Math.round(parseFloat(amount.value) * 100) : 0,
        currency: amount?.currency_code ?? "USD",
      };
    }

    if (
      event.event_type === "PAYMENT.CAPTURE.DENIED" ||
      event.event_type === "CHECKOUT.PAYMENT-APPROVAL.REVERSED"
    ) {
      if (!orderId) return { kind: "ignored" };
      return {
        kind: "payment_failed",
        orderId,
        externalId: event.id,
        paymentRef: event.resource.id ?? null,
        reason: event.event_type,
      };
    }

    if (event.event_type === "PAYMENT.CAPTURE.REFUNDED") {
      if (!orderId || !event.resource.id) return { kind: "ignored" };
      return {
        kind: "refund_succeeded",
        orderId,
        externalId: event.id,
        paymentRef: event.resource.id,
      };
    }

    return { kind: "ignored" };
  }

  async refund(paymentRef: string, amountCents: number): Promise<void> {
    // The interface doesn't carry the order's currency, and a partial
    // refund's amount must be expressed in the capture's own currency —
    // fetch the capture to find out rather than guessing.
    const capture = await paypalFetch<PayPalCaptureResponse>(
      `/v2/payments/captures/${paymentRef}`,
      { method: "GET" }
    );
    const currencyCode = capture.amount?.currency_code;
    if (!currencyCode) {
      throw new Error(`PayPal capture ${paymentRef} has no currency, cannot refund`);
    }

    await paypalFetch<PayPalCaptureResponse>(`/v2/payments/captures/${paymentRef}/refund`, {
      method: "POST",
      body: {
        amount: {
          value: (amountCents / 100).toFixed(2),
          currency_code: currencyCode,
        },
      },
    });
  }
}
