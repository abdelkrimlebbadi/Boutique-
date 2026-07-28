import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-black/70 dark:text-white/70">{t("brand")}</p>
    </div>
  );
}
