import { locales, defaultLocale } from "@/i18n/routing";
import { SITE_URL } from "./site";

// All locales share the same path shape (/products, /products/[slug],
// /search) — no per-locale path translation — so hreflang alternates are
// just the same path prefixed with each locale.
export function buildLanguageAlternates(
  pathWithoutLocale: string
): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) {
    languages[locale] = `${SITE_URL}/${locale}${pathWithoutLocale}`;
  }
  languages["x-default"] = `${SITE_URL}/${defaultLocale}${pathWithoutLocale}`;
  return languages;
}
