import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import type { CategoryView } from "@/lib/catalog/types";

export function CategoryGrid({ categories }: { categories: CategoryView[] }) {
  const t = useTranslations("home");
  if (categories.length === 0) return null;

  return (
    <section className="py-12 lg:py-20">
      <Container>
        <h2 className="mb-6 font-display text-2xl font-semibold lg:mb-8">
          {t("categoriesTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-px bg-neutral-200 sm:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              className="group flex items-center justify-between bg-neutral-0 px-6 py-8 transition-colors duration-(--duration-base) hover:bg-neutral-100"
            >
              <span className="font-display text-lg font-semibold">
                {category.name}
              </span>
              <span
                aria-hidden
                className="inline-block text-neutral-500 transition-transform duration-(--duration-base) ease-(--ease-standard) group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
