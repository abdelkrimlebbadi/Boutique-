import "server-only";

// YouCan Pay REST client — LOW CONFIDENCE. This environment has no
// internet access to verify YouCan Pay's actual API surface (endpoints,
// field names, signature scheme) against their current documentation.
// Every shape below is a plausible best-effort guess, isolated here so it
// can be corrected without touching anything else in the payment
// abstraction. Do NOT enable this in production (PAYMENT_PROVIDER=youcan_pay
// / a Moroccan shipping address routing here by default) without first
// validating against a real sandbox account — see selectPaymentProvider in
// src/lib/payments/select-provider.ts for how to temporarily route `MA`
// orders to PayPal instead by changing a single line.

function getApiBase(): string {
  return process.env.YOUCAN_PAY_API_BASE ?? "https://youcanpay.com/api";
}

export type CreatePaymentParams = {
  amountCents: number;
  currency: string;
  orderId: string;
  orderNumber: string;
  contactEmail: string;
  successUrl: string;
  failureUrl: string;
};

export type CreatePaymentResult = {
  checkoutUrl: string;
  paymentId: string;
};

// TODO: verify against the official YouCan Pay documentation before
// production use — endpoint path, request field names, and response shape
// are unconfirmed.
export async function createPayment(
  params: CreatePaymentParams
): Promise<CreatePaymentResult> {
  const publicKey = process.env.YOUCAN_PAY_PUBLIC_KEY;
  const secretKey = process.env.YOUCAN_PAY_SECRET_KEY;
  if (!publicKey || !secretKey) {
    throw new Error("YOUCAN_PAY_PUBLIC_KEY / YOUCAN_PAY_SECRET_KEY not configured");
  }

  const response = await fetch(`${getApiBase()}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_key: publicKey,
      amount: params.amountCents,
      currency: params.currency,
      order_id: params.orderId,
      order_number: params.orderNumber,
      email: params.contactEmail,
      success_url: params.successUrl,
      failure_url: params.failureUrl,
    }),
  });

  if (!response.ok) {
    throw new Error(`YouCan Pay create payment failed: ${response.status}`);
  }

  const body = (await response.json()) as { checkout_url: string; id: string };
  return { checkoutUrl: body.checkout_url, paymentId: body.id };
}

// TODO: confirm the actual header name and signing scheme. Working
// assumption: HMAC-SHA256 of the raw request body with
// YOUCAN_PAY_WEBHOOK_SECRET, common among Moroccan payment gateways built
// on CMI, hex-encoded in an `x-youcan-pay-signature` header.
export const YOUCAN_PAY_SIGNATURE_HEADER = "x-youcan-pay-signature";

// TODO: confirm refund endpoint path and payload shape.
export async function refundPayment(paymentId: string, amountCents: number): Promise<void> {
  const secretKey = process.env.YOUCAN_PAY_SECRET_KEY;
  if (!secretKey) throw new Error("YOUCAN_PAY_SECRET_KEY not configured");

  const response = await fetch(`${getApiBase()}/payments/${paymentId}/refund`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: amountCents }),
  });

  if (!response.ok) {
    throw new Error(`YouCan Pay refund failed: ${response.status}`);
  }
}
