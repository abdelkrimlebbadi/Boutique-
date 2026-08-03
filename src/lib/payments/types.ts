import type { Currency } from "@/lib/currency/constants";
import type { Locale } from "@/i18n/routing";

export type PaymentProviderName = "paypal" | "youcan_pay" | "mock";

// A narrow DTO, not the `orders` row itself — keeps the DB schema from
// leaking into every provider implementation and forces the caller to
// decide explicitly what actually leaves the system toward a third party.
export type CreateSessionInput = {
  orderId: string;
  orderNumber: string;
  totalCents: number;
  currency: Currency;
  contactEmail: string;
  locale: Locale;
  returnUrl: string;
  cancelUrl: string;
};

export type CreateSessionResult = {
  redirectUrl: string;
  externalId: string;
};

// `orderId` (not just the provider's externalId) must be recoverable from
// every verified event — each provider embeds it in a field that's echoed
// back on the webhook (PayPal: custom_id) so the webhook handler never has
// to guess which order a payment belongs to.
export type VerifiedEvent =
  | {
      kind: "payment_succeeded";
      orderId: string;
      externalId: string;
      paymentRef: string;
      amountCents: number;
      currency: string;
    }
  | {
      kind: "payment_failed";
      orderId: string;
      externalId: string;
      paymentRef: string | null;
      reason?: string;
    }
  | {
      kind: "refund_succeeded";
      orderId: string;
      externalId: string;
      paymentRef: string;
    }
  | { kind: "ignored" };

export type VerifyWebhookInput = {
  rawBody: string;
  headers: Headers;
};

export type CaptureResult = {
  paymentRef: string;
  amountCents: number;
  currency: string;
};

export interface PaymentProvider {
  createSession(input: CreateSessionInput): Promise<CreateSessionResult>;
  verifyWebhook(input: VerifyWebhookInput): Promise<VerifiedEvent>;
  refund(paymentRef: string, amountCents: number): Promise<void>;

  // Optional, for providers whose redirect flow separates approval from
  // settlement (PayPal Orders v2: the customer approving only authorises
  // the order — money moves on an explicit capture call). Invoked when the
  // customer lands back on the return URL. Providers where approval
  // already settles the payment leave it undefined.
  captureOnReturn?(externalId: string): Promise<CaptureResult | null>;
}
