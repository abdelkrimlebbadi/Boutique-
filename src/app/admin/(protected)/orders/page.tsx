import Link from "next/link";
import { listOrders } from "@/lib/admin/orders-query";
import { OrdersFilterBar } from "@/components/admin/orders/OrdersFilterBar";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";
import type { Database } from "@/types/database.types";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    provider?: string;
    from?: string;
    to?: string;
    q?: string;
    cursor?: string;
  }>;
}) {
  const params = await searchParams;

  const filters = {
    status: params.status as Database["public"]["Enums"]["order_status"] | undefined,
    provider: params.provider as Database["public"]["Enums"]["payment_provider"] | undefined,
    from: params.from,
    to: params.to,
    q: params.q,
    cursor: params.cursor,
  };

  const { items, nextCursor } = await listOrders(filters);

  const exportParams = new URLSearchParams();
  if (params.status) exportParams.set("status", params.status);
  if (params.provider) exportParams.set("provider", params.provider);
  if (params.from) exportParams.set("from", params.from);
  if (params.to) exportParams.set("to", params.to);
  if (params.q) exportParams.set("q", params.q);

  const nextParams = new URLSearchParams(exportParams);
  if (nextCursor) nextParams.set("cursor", nextCursor);

  return (
    <AdminContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Commandes</h1>
        <Link
          href={`/admin/orders/export?${exportParams.toString()}`}
          className="border border-black px-3 py-2 text-sm transition-colors duration-(--duration-base) hover:bg-black hover:text-white"
        >
          Exporter CSV
        </Link>
      </div>

      <OrdersFilterBar initial={params} />
      <OrdersTable items={items} />

      {nextCursor && (
        <div className="mt-4">
          <Link
            href={`/admin/orders?${nextParams.toString()}`}
            className="border border-black px-3 py-2 text-sm transition-colors duration-(--duration-base) hover:bg-black hover:text-white"
          >
            Page suivante
          </Link>
        </div>
      )}
    </AdminContainer>
  );
}
