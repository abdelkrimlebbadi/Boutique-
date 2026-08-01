import { getCustomerOrders } from "@/lib/admin/customers-query";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const orders = await getCustomerOrders(customerId);

  return (
    <AdminContainer>
      <h1 className="mb-2 font-display text-2xl font-semibold">Historique client</h1>
      <p className="mb-6 text-sm text-neutral-500">{customerId}</p>
      <OrdersTable items={orders} />
    </AdminContainer>
  );
}
