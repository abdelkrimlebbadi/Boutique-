import Link from "next/link";
import { listCatalogProducts } from "@/lib/printful/catalog";
import { AdminContainer } from "@/components/admin/ui/AdminContainer";
import { Input } from "@/components/admin/ui/Input";
import { Button } from "@/components/admin/ui/Button";

export default async function ImportPrintfulProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  let products: Awaited<ReturnType<typeof listCatalogProducts>> = [];
  let error: string | null = null;
  try {
    products = await listCatalogProducts(q);
  } catch (fetchError) {
    console.error("listCatalogProducts failed:", fetchError);
    error = "Impossible de charger le catalogue Printful.";
  }

  return (
    <AdminContainer>
      <h1 className="mb-2 font-display text-2xl font-semibold">Importer depuis Printful</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Le catalogue public Printful (produits vierges) est un espace d&apos;identifiants
        différent de l&apos;API Sync utilisée pour la commande. Importer ici ne crée rien côté
        Printful — vous devrez encore créer le vrai produit Sync dans le dashboard Printful et
        coller les identifiants de variante réels dans la fiche produit avant qu&apos;il soit
        commandable.
      </p>

      <form method="get" className="mb-6 flex gap-2">
        <Input name="q" defaultValue={q ?? ""} placeholder="Rechercher un produit..." className="max-w-sm" />
        <Button type="submit">Rechercher</Button>
      </form>

      {error && <p className="text-sm">{error}</p>}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/admin/products/import/${product.id}`}
            className="flex flex-col gap-2 border border-black p-3 text-sm transition-colors duration-(--duration-base) hover:bg-black hover:text-white"
          >
            {product.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- external Printful CDN, admin-only preview
              <img src={product.imageUrl} alt={product.name} className="aspect-square w-full object-cover" />
            )}
            <span>{product.name}</span>
          </Link>
        ))}
      </div>
    </AdminContainer>
  );
}
