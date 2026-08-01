import "server-only";
import { z } from "zod";
import { createPayment, refundPayment, YOUCAN_PAY_SIGNATURE_HEADER } from "./client";
import { verifyHmacSignature, WebhookVerificationError } from "@/lib/payments/verify-hmac";
import type {
  CreateSessionInput,
  CreateSessionResult,
  PaymentProvider,
  VerifiedEvent,
  VerifyWebhookInput,
} from "@/lib/payments/types";

// See client.ts — LOW CONFIDENCE implementation, unverified against real
// YouCan Pay documentation in this environment.

const webhookPayloadSchema = z.object({
  id: z.string(),
  order_id: z.string().uuid(),
  status: z.enum(["paid", "failed"]),
  amount: z.number().int().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
});

export class YouCanPayProvider implements PaymentProvider {
  async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const result = await createPayment({
      amountCents: input.totalCents,
      currency: input.currency,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      contactEmail: input.contactEmail,
      successUrl: input.returnUrl,
      failureUrl: input.cancelUrl,
    });

    return { redirectUrl: result.checkoutUrl, externalId: result.paymentId };
  }

  async verifyWebhook(input: VerifyWebhookInput): Promise<VerifiedEvent> {
    const secret = process.env.YOUCAN_PAY_WEBHOOK_SECRET;
    if (!secret) throw new WebhookVerificationError("YOUCAN_PAY_WEBHOOK_SECRET not configured");

    const signature = input.headers.get(YOUCAN_PAY_SIGNATURE_HEADER);
    if (!verifyHmacSignature(input.rawBody, signature, secret)) {
      throw new WebhookVerificationError("invalid YouCan Pay webhook signature");
    }

    const parsed = webhookPayloadSchema.safeParse(JSON.parse(input.rawBody));
    if (!parsed.success) throw new WebhookVerificationError("unexpected YouCan Pay webhook payload");
    const event = parsed.data;

    if (event.status === "paid") {
      return {
        kind: "payment_succeeded",
        orderId: event.order_id,
        externalId: event.id,
        paymentRef: event.id,
        amountCents: event.amount,
        currency: event.currency,
      };
    }

    return {
      kind: "payment_failed",
      orderId: event.order_id,
      externalId: event.id,
      paymentRef: event.id,
    };
  }

  async refund(paymentRef: string, amountCents: number): Promise<void> {
    await refundPayment(paymentRef, amountCents);
  }
}
