import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="font-display text-6xl font-semibold text-neutral-300">404</p>
      <h1 className="font-display text-2xl font-semibold text-neutral-900">
        {t("notFoundTitle")}
      </h1>
      <p className="text-neutral-600">{t("notFoundMessage")}</p>
      <Link
        href="/"
        className="mt-2 inline-flex h-11 items-center border border-neutral-900 px-6 text-sm font-medium text-neutral-900 transition-colors duration-(--duration-base) hover:border-accent-600 hover:text-accent-600"
      >
        {t("backToHome")}
      </Link>
    </div>
  );
}
