import { notFound } from "next/navigation";
import { getDiscountCode } from "@/lib/admin/discounts-query";
import { deleteDiscountCode } from "@/actions/admin/discounts";
import { DiscountForm } from "@/components/admin/discounts/DiscountForm";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";
import { Button } from "@/components/admin/ui/Button";

export default async function EditDiscountCodePage({
  params,
}: {
  params: Promise<{ discountId: string }>;
}) {
  const { discountId } = await params;
  const code = await getDiscountCode(discountId);
  if (!code) notFound();

  return (
    <AdminContainer className="max-w-md">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Modifier le code</h1>
        <form action={deleteDiscountCode.bind(null, { discountId })}>
          <Button type="submit">Supprimer</Button>
        </form>
      </div>
      <DiscountForm initial={code} />
    </AdminContainer>
  );
}
