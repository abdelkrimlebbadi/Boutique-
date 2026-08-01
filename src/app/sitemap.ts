import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { locales } from "@/i18n/routing";
import { buildLanguageAlternates } from "@/lib/seo/alternates";
import { SITE_URL } from "@/lib/seo/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/products", "/search"];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.flatMap((path) =>
    locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      alternates: { languages: buildLanguageAlternates(path) },
      changeFrequency: path === "" ? "weekly" : "daily",
      priority: path === "" ? 1 : 0.8,
    }))
  );

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("status", "active");

  const productEntries: MetadataRoute.Sitemap = (products ?? []).flatMap(
    (product) =>
      locales.map((locale) => ({
        url: `${SITE_URL}/${locale}/products/${product.slug}`,
        alternates: {
          languages: buildLanguageAlternates(`/products/${product.slug}`),
        },
        lastModified: product.updated_at ?? undefined,
        changeFrequency: "weekly",
        priority: 0.6,
      }))
  );

  return [...staticEntries, ...productEntries];
}
