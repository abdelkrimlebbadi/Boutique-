import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { nextDayIso } from "./date-range";

export type DailyRevenuePoint = { day: string; totalCents: number; orderCount: number };

export type TopProduct = {
  productKey: string;
  name: string;
  quantity: number;
  revenueCents: number;
};

export type DashboardMetrics = {
  perCurrency: Record<string, DailyRevenuePoint[]>;
  aov: Record<string, number>;
  conversionRate: number;
  topProducts: TopProduct[];
};

// Bundles the dashboard's reads: two aggregation RPCs (admin_daily_revenue,
// admin_top_products — see the migration for why they're SQL functions
// rather than a supabase-js query) plus two lightweight cart counts for
// the cart->order conversion rate (the only conversion signal this schema
// supports — there is no pageview/session table).
export async function getDashboardMetrics({
  from,
  to,
}: {
  from: string;
  to: string;
}): Promise<DashboardMetrics> {
  const serviceRole = createServiceRoleClient();
  const periodEnd = nextDayIso(to);

  const [dailyRevenueResult, topProductsResult, totalCartsResult, convertedCartsResult] =
    await Promise.all([
      serviceRole.rpc("admin_daily_revenue", { p_start: from, p_end: to }),
      serviceRole.rpc("admin_top_products", { p_start: from, p_end: to, p_limit: 10 }),
      serviceRole
        .from("carts")
        .select("id", { count: "exact", head: true })
        .gte("created_at", from)
        .lt("created_at", periodEnd),
      serviceRole
        .from("carts")
        .select("id", { count: "exact", head: true })
        .eq("status", "converted")
        .gte("created_at", from)
        .lt("created_at", periodEnd),
    ]);

  const perCurrency: Record<string, DailyRevenuePoint[]> = {};
  const sumByCurrency: Record<string, { totalCents: number; orderCount: number }> = {};

  for (const row of dailyRevenueResult.data ?? []) {
    (perCurrency[row.currency] ??= []).push({
      day: row.day,
      totalCents: row.total_cents,
      orderCount: row.order_count,
    });
    const sum = (sumByCurrency[row.currency] ??= { totalCents: 0, orderCount: 0 });
    sum.totalCents += row.total_cents;
    sum.orderCount += row.order_count;
  }

  const aov: Record<string, number> = {};
  for (const [currency, sum] of Object.entries(sumByCurrency)) {
    aov[currency] = sum.orderCount > 0 ? Math.round(sum.totalCents / sum.orderCount) : 0;
  }

  const totalCarts = totalCartsResult.count ?? 0;
  const convertedCarts = convertedCartsResult.count ?? 0;
  const conversionRate = totalCarts > 0 ? convertedCarts / totalCarts : 0;

  const topProducts: TopProduct[] = (topProductsResult.data ?? []).map((row) => ({
    productKey: row.product_key,
    name: row.name,
    quantity: row.quantity,
    revenueCents: row.revenue_cents,
  }));

  return { perCurrency, aov, conversionRate, topProducts };
}
