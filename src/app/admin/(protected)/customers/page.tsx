import Link from "next/link";
import { listCustomerSummaries } from "@/lib/admin/customers-query";
import { CustomersTable } from "@/components/admin/customers/CustomersTable";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;
  const { items, nextCursor } = await listCustomerSummaries(cursor ?? null);

  return (
    <AdminContainer>
      <h1 className="mb-6 font-display text-2xl font-semibold">Clients</h1>
      <CustomersTable items={items} />
      {nextCursor && (
        <div className="mt-4">
          <Link
            href={`/admin/customers?cursor=${encodeURIComponent(nextCursor)}`}
            className="border border-black px-3 py-2 text-sm transition-colors duration-(--duration-base) hover:bg-black hover:text-white"
          >
            Page suivante
          </Link>
        </div>
      )}
    </AdminContainer>
  );
}
