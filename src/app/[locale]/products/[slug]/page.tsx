import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProductBySlug } from "@/lib/catalog/get-product-by-slug";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchasePanel } from "@/components/product/ProductPurchasePanel";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { breadcrumbSchema, productSchema } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug, locale as Locale);
  if (!product) return {};

  return buildMetadata({
    title: product.seoTitle ?? product.name,
    description: product.seoDesc ?? product.description ?? undefined,
    path: `/products/${slug}`,
    locale,
    images: product.images.map((image) => image.url),
  });
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const [product, navT, breadcrumbT] = await Promise.all([
    getProductBySlug(slug, locale as Locale),
    getTranslations("nav"),
    getTranslations("breadcrumb"),
  ]);

  if (!product) notFound();

  const breadcrumbItems = [
    { name: breadcrumbT("home"), path: "" },
    { name: navT("products"), path: "/products" },
    ...(product.category
      ? [
          {
            name: product.category.name,
            path: `/products?category=${product.category.slug}`,
          },
        ]
      : []),
    { name: product.name, path: `/products/${product.slug}` },
  ];

  return (
    <Container className="py-8 lg:py-12">
      <JsonLd data={breadcrumbSchema(breadcrumbItems, locale)} />
      <JsonLd data={productSchema(product, locale)} />

      <Breadcrumbs items={breadcrumbItems} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} productName={product.name} />
        <div>
          <h1 className="font-display text-2xl font-semibold lg:text-3xl">
            {product.name}
          </h1>
          {product.description && (
            <p className="mt-3 text-md text-neutral-600">{product.description}</p>
          )}
          <div className="mt-8">
            <ProductPurchasePanel
              productSlug={product.slug}
              productName={product.name}
              imageUrl={product.images[0]?.url ?? null}
              variants={product.variants}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
