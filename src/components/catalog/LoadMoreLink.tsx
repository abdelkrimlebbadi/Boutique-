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
      className="inline-flex h-11 items-center border border-neutral-900 px-6 text-sm font-medium text-neutral-900 transition-colors duration-(--duration-base) ease-(--ease-standard) hover:border-accent-600 hover:text-accent-600"
    >
      {t("loadMore")}
    </Link>
  );
}
