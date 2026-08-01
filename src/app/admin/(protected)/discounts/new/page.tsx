import { DiscountForm } from "@/components/admin/discounts/DiscountForm";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";

export default function NewDiscountCodePage() {
  return (
    <AdminContainer className="max-w-md">
      <h1 className="mb-6 font-display text-2xl font-semibold">Nouveau code promo</h1>
      <DiscountForm initial={null} />
    </AdminContainer>
  );
}
