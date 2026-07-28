import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { listOrdersForExport } from "@/lib/admin/orders-query";
import { buildCsv } from "@/lib/admin/csv";
import type { Database } from "@/types/database.types";

// A Route Handler, not a Server Action: a Server Action can't produce a
// raw HTTP response with Content-Disposition: attachment — it always
// returns a value/redirect to the calling component, never controls
// response headers directly. This is a second, narrow exception to
// "Server Actions for all mutations" alongside /api/webhooks/[provider]
// (this one is a read, but the same "needs raw HTTP response control"
// justification applies). Lives under src/app/admin/... (not
// src/app/api/...) so it's covered by the same /admin/** middleware
// auth branch as the rest of the admin panel.

const CSV_COLUMNS = [
  "order_number",
  "created_at",
  "status",
  "contact_email",
  "shipping_country_code",
  "currency",
  "subtotal_cents",
  "shipping_cents",
  "tax_cents",
  "discount_cents",
  "total_cents",
  "payment_provider",
  "payment_ref",
];

export async function GET(request: NextRequest): Promise<Response> {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Admin access required" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const filters = {
    status:
      (searchParams.get("status") as Database["public"]["Enums"]["order_status"] | null) ??
      undefined,
    provider:
      (searchParams.get("provider") as Database["public"]["Enums"]["payment_provider"] | null) ??
      undefined,
    from: searchParams.get("from") ?? undefined,
    to: searchParams.get("to") ?? undefined,
    q: searchParams.get("q") ?? undefined,
  };

  const orders = await listOrdersForExport(filters);

  const rows = orders.map((order) => ({
    order_number: order.order_number,
    created_at: order.created_at,
    status: order.status,
    contact_email: order.contact_email,
    shipping_country_code:
      (order.shipping_address as { countryCode?: string } | null)?.countryCode ?? "",
    currency: order.currency,
    subtotal_cents: order.subtotal_cents,
    shipping_cents: order.shipping_cents,
    tax_cents: order.tax_cents,
    discount_cents: order.discount_cents,
    total_cents: order.total_cents,
    payment_provider: order.payment_provider,
    payment_ref: order.payment_ref ?? "",
  }));

  const csv = buildCsv(rows, CSV_COLUMNS);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes-${Date.now()}.csv"`,
    },
  });
}
