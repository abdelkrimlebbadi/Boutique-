import { emptyProductEditData, listCategoryOptions } from "@/lib/admin/products-query";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";

export default async function NewProductPage() {
  const categoryOptions = await listCategoryOptions();

  return (
    <AdminContainer className="max-w-4xl">
      <h1 className="mb-6 font-display text-2xl font-semibold">Nouveau produit</h1>
      <ProductForm initial={emptyProductEditData()} categoryOptions={categoryOptions} />
    </AdminContainer>
  );
}
