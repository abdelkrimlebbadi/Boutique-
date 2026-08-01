import { notFound } from "next/navigation";
import { getCatalogProductVariants } from "@/lib/printful/catalog";
import { ImportReviewForm } from "@/components/admin/products/ImportReviewForm";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";

export default async function ImportCatalogProductPage({
  params,
}: {
  params: Promise<{ catalogProductId: string }>;
}) {
  const { catalogProductId } = await params;
  const id = Number(catalogProductId);
  if (!Number.isFinite(id)) notFound();

  let detail;
  try {
    detail = await getCatalogProductVariants(id);
  } catch (error) {
    console.error("getCatalogProductVariants failed:", error);
    notFound();
  }

  return (
    <AdminContainer className="max-w-3xl">
      <h1 className="mb-6 font-display text-2xl font-semibold">{detail.name}</h1>
      <ImportReviewForm detail={detail} />
    </AdminContainer>
  );
}
