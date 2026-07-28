import Link from "next/link";
import { listDiscountCodes, discountCodeStatus } from "@/lib/admin/discounts-query";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/admin/ui/Table";
import { Button } from "@/components/admin/ui/Button";

export default async function AdminDiscountsPage() {
  const codes = await listDiscountCodes();

  return (
    <AdminContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Codes promo</h1>
        <Link href="/admin/discounts/new">
          <Button type="button">Nouveau code</Button>
        </Link>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Code</Th>
            <Th>Type</Th>
            <Th align="right">Valeur</Th>
            <Th align="right">Utilisations</Th>
            <Th>Statut</Th>
          </Tr>
        </Thead>
        <Tbody>
          {codes.map((code) => {
            const status = discountCodeStatus(code);
            return (
              <Tr key={code.id}>
                <Td>
                  <Link
                    href={`/admin/discounts/${code.id}/edit`}
                    className="underline underline-offset-2"
                  >
                    {code.code}
                  </Link>
                </Td>
                <Td>{code.type}</Td>
                <Td align="right">
                  {code.type === "fixed"
                    ? `${((code.amount_cents ?? 0) / 100).toFixed(2)}`
                    : `${code.percentage}%`}
                </Td>
                <Td align="right">
                  {code.used_count}
                  {code.max_uses != null ? ` / ${code.max_uses}` : ""}
                </Td>
                <Td>
                  <StatusChip negative={status.negative}>{status.label}</StatusChip>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </AdminContainer>
  );
}
