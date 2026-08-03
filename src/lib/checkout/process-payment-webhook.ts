import "server-only";
import { getPaymentProviderByName } from "@/lib/payments/select-provider";
import { WebhookVerificationError } from "@/lib/payments/verify-hmac";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { handlePaymentSucceeded, handlePaymentFailed } from "./handle-payment-event";
import type { PaymentProviderName } from "@/lib/payments/types";

export type PaymentWebhookResult = { ok: true } | { ok: false; status: number; error: string };

// Verify → claim → process, independent of how the payload arrived. The
// /api/webhooks/[provider] route passes what a real provider POSTed;
// simulateMockPayment passes a payload it signed itself and calls this
// directly, because a Worker cannot fetch its own hostname (Cloudflare
// error 1042). Sharing this function keeps the mock flow on the same
// verification and idempotence path rather than a shortcut around it.
export async function processPaymentWebhook({
  rawBody,
  headers,
  providerName,
}: {
  rawBody: string;
  headers: Headers;
  providerName: PaymentProviderName;
}): Promise<PaymentWebhookResult> {
  const provider = getPaymentProviderByName(providerName);

  let event;
  try {
    event = await provider.verifyWebhook({ rawBody, headers });
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      console.error(`${providerName} webhook verification failed:`, error.message);
      return { ok: false, status: 401, error: "invalid signature" };
    }
    throw error;
  }

  if (event.kind === "ignored") return { ok: true };

  const supabase = createServiceRoleClient();
  const { data: claimedId, error: claimError } = await supabase.rpc("claim_webhook_event", {
    p_provider: providerName,
    p_external_id: event.externalId,
    p_payload: JSON.parse(rawBody),
  });
  if (claimError) {
    console.error(`claim_webhook_event (${providerName}) failed:`, claimError);
    return { ok: false, status: 500, error: "internal error" };
  }
  // null: already processed, or another attempt claimed it very recently —
  // ack without reprocessing so the provider doesn't keep retrying.
  if (!claimedId) return { ok: true };

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
    return { ok: false, status: 500, error: "processing failed" };
  }

  await supabase
    .from("webhook_events")
    .update({ processed_at: new Date().toISOString() })
    .eq("id", claimedId);

  return { ok: true };
}
