import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/admin/ui/Table";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import type { OrderListItem } from "@/lib/admin/orders-query";

const NEGATIVE_STATUSES = new Set(["cancelled", "refunded", "failed"]);

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

export function OrdersTable({ items }: { items: OrderListItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Aucune commande.</p>;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>N° commande</Th>
          <Th>Date</Th>
          <Th>Client</Th>
          <Th>Prestataire</Th>
          <Th align="right">Total</Th>
          <Th>Statut</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((item) => (
          <Tr key={item.id}>
            <Td>
              <Link href={`/admin/orders/${item.id}`} className="underline underline-offset-2">
                {item.orderNumber}
              </Link>
            </Td>
            <Td>{new Date(item.createdAt).toLocaleDateString("fr-FR")}</Td>
            <Td>{item.contactEmail}</Td>
            <Td>{item.paymentProvider}</Td>
            <Td align="right">{formatCents(item.totalCents, item.currency)}</Td>
            <Td>
              <StatusChip negative={NEGATIVE_STATUSES.has(item.status)}>{item.status}</StatusChip>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
