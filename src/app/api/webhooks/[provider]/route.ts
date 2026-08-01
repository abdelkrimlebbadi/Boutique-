import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getPaymentProviderByName } from "@/lib/payments/select-provider";
import { WebhookVerificationError } from "@/lib/payments/verify-hmac";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { handlePaymentSucceeded, handlePaymentFailed } from "@/lib/checkout/handle-payment-event";
import { handlePrintfulShipmentWebhook } from "@/lib/printful/handle-shipment-webhook";
import type { PaymentProviderName } from "@/lib/payments/types";

// The project's one deliberate exception to "Server Actions for all
// mutations" (see CLAUDE.md): external providers can only reach the app
// through a plain HTTP endpoint, not a Server Action.

const PAYMENT_PROVIDER_NAMES: readonly PaymentProviderName[] = ["paypal", "youcan_pay", "mock"];

function isPaymentProviderName(value: string): value is PaymentProviderName {
  return (PAYMENT_PROVIDER_NAMES as readonly string[]).includes(value);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ provider: string }> }
): Promise<Response> {
  const { provider } = await params;

  if (provider === "printful") return handlePrintfulRequest(req);
  if (isPaymentProviderName(provider)) return handlePaymentRequest(req, provider);

  return NextResponse.json({ error: "unknown provider" }, { status: 404 });
}

async function handlePaymentRequest(
  req: Request,
  providerName: PaymentProviderName
): Promise<Response> {
  const rawBody = await req.text();
  const provider = getPaymentProviderByName(providerName);

  let event;
  try {
    event = await provider.verifyWebhook({ rawBody, headers: req.headers });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error(`${providerName} webhook verification failed:`, error.message);
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
    throw error;
  }

  if (event.kind === "ignored") return NextResponse.json({ ok: true });

  const supabase = createServiceRoleClient();
  const { data: claimedId, error: claimError } = await supabase.rpc("claim_webhook_event", {
    p_provider: providerName,
    p_external_id: event.externalId,
    p_payload: JSON.parse(rawBody),
  });
  if (claimError) {
    console.error(`claim_webhook_event (${providerName}) failed:`, claimError);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
  // null: already processed, or another attempt claimed it very recently —
  // ack without reprocessing so the provider doesn't keep retrying.
  if (!claimedId) return NextResponse.json({ ok: true });

  try {
    if (event.kind === "payment_succeeded") {
      await handlePaymentSucceeded(event, providerName);
    } else if (event.kind === "payment_failed") {
      await handlePaymentFailed(event, providerName);
    }
    // refund_succeeded: no automated side effect yet — claiming the event
    // still records it so it isn't reprocessed, reconciliation is manual.
  } catch (error) {
    console.error(`${providerName} webhook processing failed:`, error);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  await supabase
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("id", claimedId);

  return NextResponse.json({ ok: true });
}

async function handlePrintfulRequest(req: Request): Promise<Response> {
  // Printful's signature scheme isn't independently verifiable in this
  // environment (see handle-shipment-webhook.ts) — a shared-secret query
  // token on the URL registered with Printful is defense-in-depth on top
  // of whatever official verification is added later.
  const url = new URL(req.url);
  const expectedToken = process.env.PRINTFUL_WEBHOOK_SECRET;
  if (!expectedToken || url.searchParams.get("token") !== expectedToken) {
    return NextResponse.json({ error: "invalid token" }, { status: 401 });
  }

  const rawBody = await req.text();
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const externalId = extractPrintfulEventId(payload, rawBody);

  const supabase = createServiceRoleClient();
  const { data: claimedId, error: claimError } = await supabase.rpc("claim_webhook_event", {
    p_provider: "printful",
    p_external_id: externalId,
    p_payload: payload as never,
  });
  if (claimError) {
    console.error("claim_webhook_event (printful) failed:", claimError);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
  if (!claimedId) return NextResponse.json({ ok: true });

  try {
    await handlePrintfulShipmentWebhook(rawBody);
  } catch (error) {
    console.error("handlePrintfulShipmentWebhook failed:", error);
    return NextResponse.json({ error: "processing failed" }, { status: 500 });
  }

  await supabase
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("id", claimedId);

  return NextResponse.json({ ok: true });
}

// Printful events don't reliably carry a single top-level unique id across
// event types (confidence: low, unverified). A stable identifier is
// required for the claim_webhook_event idempotence check regardless, so a
// numeric/string `id` field is used when present and a hash of the raw
// body otherwise — a true retry re-sends byte-identical JSON and hashes to
// the same value, while any distinct event gets a distinct one.
function extractPrintfulEventId(payload: unknown, rawBody: string): string {
  if (typeof payload === "object" && payload !== null) {
    const id = (payload as Record<string, unknown>).id;
    if (typeof id === "string" || typeof id === "number") return String(id);
  }
  return createHash("sha256").update(rawBody).digest("hex");
}
