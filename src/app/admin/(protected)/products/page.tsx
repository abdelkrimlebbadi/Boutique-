import Link from "next/link";
import { listProducts } from "@/lib/admin/products-query";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";
import { StatusChip } from "@/components/admin/ui/StatusChip";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/admin/ui/Table";
import { Button } from "@/components/admin/ui/Button";
import type { Database } from "@/types/database.types";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const products = await listProducts({
    status: params.status as Database["public"]["Enums"]["product_status"] | undefined,
    q: params.q,
  });

  return (
    <AdminContainer>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Produits</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/import">
            <Button type="button">Importer depuis Printful</Button>
          </Link>
          <Link href="/admin/products/new">
            <Button type="button">Nouveau produit</Button>
          </Link>
        </div>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Nom</Th>
            <Th>Slug</Th>
            <Th>Statut</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((product) => (
            <Tr key={product.id}>
              <Td>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="underline underline-offset-2"
                >
                  {product.name}
                </Link>
              </Td>
              <Td>{product.slug}</Td>
              <Td>
                <StatusChip negative={product.status === "archived"}>{product.status}</StatusChip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </AdminContainer>
  );
}
