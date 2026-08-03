"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getPaymentProviderByName } from "@/lib/payments/select-provider";
import { getPrintfulOrderStatus } from "@/lib/printful/get-order-status";

const refundOrderSchema = z.object({
  orderId: z.string().uuid(),
  amountCents: z.number().int().positive(),
});

export async function refundOrder(
  rawInput: z.input<typeof refundOrderSchema>
): Promise<{ error: string } | { ok: true }> {
  await requireAdmin();
  const { orderId, amountCents } = refundOrderSchema.parse(rawInput);

  const serviceRole = createServiceRoleClient();
  const { data: order } = await serviceRole.from("orders").select("*").eq("id", orderId).single();
  if (!order) return { error: "Commande introuvable." };
  if (!order.payment_ref) return { error: "Cette commande n'a pas de référence de paiement." };
  if (amountCents > order.total_cents) {
    return { error: "Le montant dépasse le total de la commande." };
  }

  try {
    await getPaymentProviderByName(order.payment_provider).refund(order.payment_ref, amountCents);
  } catch (error) {
    console.error(`refundOrder: provider refund failed for ${orderId}:`, error);
    return { error: "Le remboursement a échoué auprès du prestataire de paiement." };
  }

  // Only mark refunded AFTER the provider call succeeds — a provider
  // failure must never corrupt order status.
  const { error: updateError } = await serviceRole
    .from("orders")
    .update({
      status: "refunded",
      refunded_amount_cents: amountCents,
      refunded_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (updateError) {
    console.error(`refundOrder: order update failed after successful refund for ${orderId}:`, updateError);
    return { error: "Le remboursement a réussi mais la mise à jour de la commande a échoué." };
  }

  return { ok: true };
}

const toggleOrderFlagSchema = z.object({
  orderId: z.string().uuid(),
  flagged: z.boolean(),
});

// Same calque as refundOrder: single-table write, no RPC needed. The real
// enforcement of the flag (skipping Printful order creation) lives in
// handlePaymentSucceeded — this action only ever needs to be effective
// while the order is still pending, since that's the only window before
// Printful submission happens (see the migration's comment for why).
export async function toggleOrderFlag(
  rawInput: z.input<typeof toggleOrderFlagSchema>
): Promise<{ error: string } | { ok: true }> {
  await requireAdmin();
  const { orderId, flagged } = toggleOrderFlagSchema.parse(rawInput);

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole
    .from("orders")
    .update({ flagged_by_admin: flagged })
    .eq("id", orderId);
  if (error) {
    console.error(`toggleOrderFlag failed for ${orderId}:`, error);
    return { error: "Impossible de mettre à jour le statut de modération." };
  }

  return { ok: true };
}

const refreshPrintfulOrderStatusSchema = z.object({ printfulOrderId: z.string().min(1) });

export async function refreshPrintfulOrderStatus(
  rawInput: z.input<typeof refreshPrintfulOrderStatusSchema>
): Promise<{ error: string } | { ok: true; status: string; raw: unknown }> {
  await requireAdmin();
  const { printfulOrderId } = refreshPrintfulOrderStatusSchema.parse(rawInput);

  try {
    const result = await getPrintfulOrderStatus(printfulOrderId);
    return { ok: true, ...result };
  } catch (error) {
    console.error(`refreshPrintfulOrderStatus failed for ${printfulOrderId}:`, error);
    return { error: "Impossible de récupérer le statut Printful." };
  }
}
