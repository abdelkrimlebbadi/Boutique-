import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { OrderListItem } from "./orders-query";

export type CustomerSummary = {
  customerId: string;
  displayName: string | null;
  contactEmail: string | null;
  orderCount: number;
  lifetimeTotals: Record<string, number>;
  lastOrderAt: string;
};

export async function listCustomerSummaries(cursor: string | null): Promise<{
  items: CustomerSummary[];
  nextCursor: string | null;
}> {
  const serviceRole = createServiceRoleClient();
  const limit = 50;

  const { data } = await serviceRole.rpc("admin_customer_summaries", {
    // Same generated-Args nullability limitation as elsewhere: p_cursor is
    // null on the first page, but the RPC's Args type doesn't reflect that.
    p_cursor: cursor as string,
    p_limit: limit,
  });

  const rows = data ?? [];
  const items: CustomerSummary[] = rows.map((row) => ({
    customerId: row.customer_id,
    displayName: row.display_name,
    contactEmail: row.contact_email,
    orderCount: row.order_count,
    lifetimeTotals: (row.lifetime_totals as Record<string, number>) ?? {},
    lastOrderAt: row.last_order_at,
  }));

  const last = items[items.length - 1];
  const nextCursor = rows.length === limit && last ? last.lastOrderAt : null;

  return { items, nextCursor };
}

// Full, unfiltered order history for one customer (unlike the summary
// list, this intentionally includes pending/failed/cancelled orders too —
// it's the detail view, not the valid-revenue aggregate).
export async function getCustomerOrders(customerId: string): Promise<OrderListItem[]> {
  const serviceRole = createServiceRoleClient();
  const { data } = await serviceRole
    .from("orders")
    .select(
      "id, order_number, status, currency, total_cents, payment_provider, contact_email, created_at"
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    currency: row.currency,
    totalCents: row.total_cents,
    paymentProvider: row.payment_provider,
    contactEmail: row.contact_email,
    createdAt: row.created_at,
  }));
}
