import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "en", "es", "ar"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const rtlLocales: readonly Locale[] = ["ar"];

export function getDirection(locale: Locale): "rtl" | "ltr" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every locale, including the default, is prefixed: /fr/..., /en/..., ...
  localePrefix: "always",
  // Priority used to resolve the locale when no prefix is present in the
  // URL: cookie (NEXT_LOCALE) first, then Accept-Language, then defaultLocale.
  localeDetection: true,
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
});
