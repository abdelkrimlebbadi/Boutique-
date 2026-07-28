import { notFound } from "next/navigation";
import { getProductForEdit, listCategoryOptions } from "@/lib/admin/products-query";
import { deleteProduct } from "@/actions/admin/products";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";
import { Button } from "@/components/admin/ui/Button";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const [product, categoryOptions] = await Promise.all([
    getProductForEdit(productId),
    listCategoryOptions(),
  ]);
  if (!product) notFound();

  return (
    <AdminContainer className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold">Modifier le produit</h1>
        <form action={deleteProduct.bind(null, { productId })}>
          <Button type="submit">Supprimer</Button>
        </form>
      </div>
      <ProductForm initial={product} categoryOptions={categoryOptions} />
    </AdminContainer>
  );
}
