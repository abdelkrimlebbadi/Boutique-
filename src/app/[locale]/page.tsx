import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCategories } from "@/lib/catalog/get-categories";
import { getBestsellers } from "@/lib/catalog/get-bestsellers";
import { getTestimonials } from "@/lib/catalog/get-testimonials";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { BestsellersSection } from "@/components/home/BestsellersSection";
import { Testimonials } from "@/components/home/Testimonials";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return buildMetadata({
    title: t("title"),
    description: t("subtitle"),
    path: "",
    locale,
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const [categories, bestsellers, testimonials] = await Promise.all([
    getCategories(locale as Locale),
    getBestsellers(locale as Locale),
    getTestimonials(locale as Locale),
  ]);

  return (
    <div>
      <Hero />
      <CategoryGrid categories={categories} />
      <BestsellersSection products={bestsellers} />
      <Testimonials testimonials={testimonials} />
    </div>
  );
}
