import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function LoadMoreLink({
  basePath,
  searchParams,
  nextCursor,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  nextCursor: string;
}) {
  const t = useTranslations("catalog");
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value) params.set(key, value);
  }
  params.set("cursor", nextCursor);

  return (
    <Link
      href={`${basePath}?${params.toString()}`}
      className="mx-auto rounded-md border border-black/10 px-4 py-2 text-sm dark:border-white/20"
    >
      {t("loadMore")}
    </Link>
  );
}
