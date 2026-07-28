import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { CategoryView } from "@/lib/catalog/types";

export function CategoryGrid({ categories }: { categories: CategoryView[] }) {
  const t = useTranslations("home");
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h2 className="mb-4 text-xl font-semibold">{t("categoriesTitle")}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="rounded-lg border border-black/10 p-6 text-center font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
