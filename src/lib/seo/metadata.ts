import type { Metadata } from "next";
import { buildLanguageAlternates } from "./alternates";
import { SITE_NAME, SITE_URL } from "./site";

export function buildMetadata({
  title,
  description,
  path,
  locale,
  images,
}: {
  title: string;
  description?: string;
  path: string;
  locale: string;
  images?: string[];
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`;

  return {
    title: `${title} — ${SITE_NAME}`,
    description,
    alternates: {
      canonical: url,
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images,
      locale,
    },
  };
}
