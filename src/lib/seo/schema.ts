import { ORGANIZATION, SITE_URL } from "./site";
import type { ProductDetailView } from "@/lib/catalog/get-product-by-slug";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORGANIZATION.name,
    url: ORGANIZATION.url,
    logo: ORGANIZATION.logo,
    address: {
      "@type": "PostalAddress",
      addressCountry: ORGANIZATION.countryCode,
    },
  };
}

export function breadcrumbSchema(
  items: { name: string; path: string }[],
  locale: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}/${locale}${item.path}`,
    })),
  };
}

export function productSchema(product: ProductDetailView, locale: string) {
  const url = `${SITE_URL}/${locale}/products/${product.slug}`;
  const inStockVariants = product.variants.length > 0;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((image) => image.url),
    sku: product.variants[0]?.sku,
    url,
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      url,
      sku: variant.sku,
      priceCurrency: variant.currency,
      price: (variant.priceCents / 100).toFixed(2),
      availability: inStockVariants
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    })),
  };
}
