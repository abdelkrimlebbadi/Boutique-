import "server-only";

// Printful's public Catalog API (blank, unbranded products — browsable
// before any print file is attached). Confidence: low-moderate, same
// caveat as the rest of this Printful integration: not independently
// verified against live docs in this environment. Isolated here so it can
// be corrected without touching anything else.
//
// Important: this is a DIFFERENT id space from the Sync API that
// create-order.ts actually uses to fulfill orders. Importing a catalog
// product only pre-fills local rows — it does not create anything on
// Printful's side. See the import review screen for the on-screen note
// this gap requires.

export type CatalogProductSummary = {
  id: number;
  name: string;
  imageUrl: string | null;
};

export type CatalogVariant = {
  id: number;
  name: string;
  size: string | null;
  color: string | null;
  imageUrl: string | null;
  costCents: number;
};

export type CatalogProductDetail = {
  id: number;
  name: string;
  variants: CatalogVariant[];
};

function getApiKey(): string {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) throw new Error("PRINTFUL_API_KEY not configured");
  return apiKey;
}

export async function listCatalogProducts(query?: string): Promise<CatalogProductSummary[]> {
  const response = await fetch("https://api.printful.com/products", {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });
  if (!response.ok) {
    throw new Error(`Printful catalog list failed: ${response.status}`);
  }

  const body = (await response.json()) as {
    result: { id: number; title?: string; name?: string; image?: string }[];
  };

  const items: CatalogProductSummary[] = body.result.map((item) => ({
    id: item.id,
    name: item.title ?? item.name ?? `Produit ${item.id}`,
    imageUrl: item.image ?? null,
  }));

  if (!query) return items;
  const term = query.toLowerCase();
  return items.filter((item) => item.name.toLowerCase().includes(term));
}

export async function getCatalogProductVariants(
  catalogProductId: number
): Promise<CatalogProductDetail> {
  const response = await fetch(`https://api.printful.com/products/${catalogProductId}`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });
  if (!response.ok) {
    throw new Error(`Printful catalog product fetch failed: ${response.status}`);
  }

  const body = (await response.json()) as {
    result: {
      product: { id: number; title?: string; name?: string };
      variants: {
        id: number;
        name?: string;
        size?: string;
        color?: string;
        image?: string;
        price?: string;
      }[];
    };
  };

  return {
    id: body.result.product.id,
    name: body.result.product.title ?? body.result.product.name ?? `Produit ${catalogProductId}`,
    variants: body.result.variants.map((variant) => ({
      id: variant.id,
      name: variant.name ?? `Variante ${variant.id}`,
      size: variant.size ?? null,
      color: variant.color ?? null,
      imageUrl: variant.image ?? null,
      costCents: variant.price ? Math.round(parseFloat(variant.price) * 100) : 0,
    })),
  };
}
