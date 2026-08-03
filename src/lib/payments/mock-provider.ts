import { z } from "zod";
import { SITE_URL } from "@/lib/seo/site";
import { verifyHmacSignature, WebhookVerificationError } from "./verify-hmac";
import type {
  CreateSessionInput,
  CreateSessionResult,
  PaymentProvider,
  VerifiedEvent,
  VerifyWebhookInput,
} from "./types";

// For local dev and demos: never marks anything paid synchronously. It
// redirects to an internal page where a human clicks "simulate success/
// failure", which signs a payload and runs it through
// processPaymentWebhook — the exact same verify → claim → process path a
// real provider's webhook goes through, so the idempotence machinery is
// genuinely exercised, not bypassed.
const mockWebhookPayloadSchema = z.object({
  orderId: z.string().uuid(),
  externalId: z.string().min(1),
  outcome: z.enum(["success", "failure"]),
  amountCents: z.number().int().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
});

export class MockProvider implements PaymentProvider {
  async createSession(input: CreateSessionInput): Promise<CreateSessionResult> {
    const externalId = crypto.randomUUID();
    const redirectUrl = new URL(
      `/${input.locale}/checkout/mock-pay`,
      SITE_URL
    );
    redirectUrl.searchParams.set("order", input.orderId);
    redirectUrl.searchParams.set("externalId", externalId);
    redirectUrl.searchParams.set("amountCents", String(input.totalCents));
    redirectUrl.searchParams.set("currency", input.currency);
    return { redirectUrl: redirectUrl.toString(), externalId };
  }

  async verifyWebhook(input: VerifyWebhookInput): Promise<VerifiedEvent> {
    const secret = process.env.MOCK_WEBHOOK_SECRET;
    if (!secret) throw new WebhookVerificationError("MOCK_WEBHOOK_SECRET not configured");

    const signature = input.headers.get("x-mock-signature");
    if (!verifyHmacSignature(input.rawBody, signature, secret)) {
      throw new WebhookVerificationError("invalid mock webhook signature");
    }

    const parsed = mockWebhookPayloadSchema.safeParse(JSON.parse(input.rawBody));
    if (!parsed.success) throw new WebhookVerificationError("invalid mock webhook payload");
    const { orderId, externalId, outcome, amountCents, currency } = parsed.data;

    if (outcome === "success") {
      return {
        kind: "payment_succeeded",
        orderId,
        externalId,
        paymentRef: externalId,
        amountCents,
        currency,
      };
    }
    return { kind: "payment_failed", orderId, externalId, paymentRef: externalId };
  }

  async refund(paymentRef: string): Promise<void> {
    console.log(`[mock] refund requested for ${paymentRef} — no-op`);
  }
}
