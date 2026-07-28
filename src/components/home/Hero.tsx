import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("home");

  return (
    <section className="mx-auto flex max-w-4xl flex-col items-start gap-4 px-6 py-20">
      <h1 className="text-4xl font-bold sm:text-5xl">{t("title")}</h1>
      <p className="max-w-xl text-lg text-black/70 dark:text-white/70">
        {t("subtitle")}
      </p>
      <Link
        href="/products"
        className="mt-2 rounded-md bg-black px-6 py-3 font-medium text-white dark:bg-white dark:text-black"
      >
        {t("heroCta")}
      </Link>
    </section>
  );
}
