import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { encodeCursor, decodeCursor } from "@/lib/catalog/cursor";
import { nextDayIso } from "./date-range";
import type { Database } from "@/types/database.types";

const PAGE_SIZE = 30;

export type OrdersFilters = {
  status?: Database["public"]["Enums"]["order_status"];
  provider?: Database["public"]["Enums"]["payment_provider"];
  from?: string;
  to?: string;
  q?: string;
  cursor?: string;
};

export type OrderListItem = {
  id: string;
  orderNumber: string;
  status: Database["public"]["Enums"]["order_status"];
  currency: string;
  totalCents: number;
  paymentProvider: Database["public"]["Enums"]["payment_provider"];
  contactEmail: string;
  createdAt: string;
};

export type OrderListResult = { items: OrderListItem[]; nextCursor: string | null };

// `.or()`'s filter string uses `,` as a separator and `%`/`*` as ilike
// wildcards — strip them out of free-text search input rather than trying
// to escape them, simplest way to avoid a malformed filter.
function sanitizeSearchTerm(term: string): string {
  return term.replace(/[%,*]/g, "").trim();
}

// Not shared as a higher-order function taking a query builder: the
// builder's generic row type differs between listOrders' partial select
// and listOrdersForExport's select("*"), which fights supabase-js's
// generics more than it's worth for ~5 lines of filter chaining. Each
// caller applies filters inline instead.

export async function listOrders(filters: OrdersFilters): Promise<OrderListResult> {
  const serviceRole = createServiceRoleClient();

  let query = serviceRole
    .from("orders")
    .select(
      "id, order_number, status, currency, total_cents, payment_provider, contact_email, created_at"
    )
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PAGE_SIZE + 1);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.provider) query = query.eq("payment_provider", filters.provider);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lt("created_at", nextDayIso(filters.to));
  if (filters.q) {
    const term = sanitizeSearchTerm(filters.q);
    if (term) query = query.or(`order_number.ilike.%${term}%,contact_email.ilike.%${term}%`);
  }

  if (filters.cursor) {
    const cursor = decodeCursor(filters.cursor);
    if (cursor) {
      query = query.or(
        `created_at.lt.${cursor.v},and(created_at.eq.${cursor.v},id.lt.${cursor.id})`
      );
    }
  }

  const { data } = await query;
  const rows = data ?? [];
  const hasMore = rows.length > PAGE_SIZE;
  const page = rows.slice(0, PAGE_SIZE);

  const items: OrderListItem[] = page.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    status: row.status,
    currency: row.currency,
    totalCents: row.total_cents,
    paymentProvider: row.payment_provider,
    contactEmail: row.contact_email,
    createdAt: row.created_at,
  }));

  const last = items[items.length - 1];
  const nextCursor = hasMore && last ? encodeCursor({ v: last.createdAt, id: last.id }) : null;

  return { items, nextCursor };
}

export type OrderDetail = {
  order: Database["public"]["Tables"]["orders"]["Row"];
  items: Database["public"]["Tables"]["order_items"]["Row"][];
};

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const serviceRole = createServiceRoleClient();

  const { data: order } = await serviceRole
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return null;

  const { data: items } = await serviceRole
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  return { order, items: items ?? [] };
}

// Used by /admin/orders/export (no pagination — a soft safety cap keeps a
// runaway export from ever being unbounded, plenty for this store's scale).
const EXPORT_ROW_LIMIT = 20000;

export async function listOrdersForExport(
  filters: Omit<OrdersFilters, "cursor">
): Promise<Database["public"]["Tables"]["orders"]["Row"][]> {
  const serviceRole = createServiceRoleClient();

  let query = serviceRole
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(EXPORT_ROW_LIMIT);

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.provider) query = query.eq("payment_provider", filters.provider);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lt("created_at", nextDayIso(filters.to));
  if (filters.q) {
    const term = sanitizeSearchTerm(filters.q);
    if (term) query = query.or(`order_number.ilike.%${term}%,contact_email.ilike.%${term}%`);
  }

  const { data } = await query;
  return data ?? [];
}
