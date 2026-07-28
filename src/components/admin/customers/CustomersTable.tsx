import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/admin/ui/Table";
import type { CustomerSummary } from "@/lib/admin/customers-query";

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(cents / 100);
}

export function CustomersTable({ items }: { items: CustomerSummary[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Aucun client.</p>;
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Client</Th>
          <Th align="right">Commandes</Th>
          <Th>Total à vie</Th>
          <Th>Dernière commande</Th>
        </Tr>
      </Thead>
      <Tbody>
        {items.map((item) => (
          <Tr key={item.customerId}>
            <Td>
              <Link
                href={`/admin/customers/${item.customerId}`}
                className="underline underline-offset-2"
              >
                {item.displayName ?? item.contactEmail ?? item.customerId}
              </Link>
              {item.displayName && item.contactEmail && (
                <span className="block text-xs text-neutral-500">{item.contactEmail}</span>
              )}
            </Td>
            <Td align="right">{item.orderCount}</Td>
            <Td>
              {Object.entries(item.lifetimeTotals).map(([currency, cents]) => (
                <span key={currency} className="mr-2 inline-block border border-black px-1.5 py-0.5 text-xs">
                  {formatCents(cents, currency)}
                </span>
              ))}
            </Td>
            <Td>{new Date(item.lastOrderAt).toLocaleDateString("fr-FR")}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
