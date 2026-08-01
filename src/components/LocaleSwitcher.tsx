"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";
import { Select } from "@/components/ui/Select";

// Language names are always shown in their own language, not translated.
const NATIVE_NAMES: Record<Locale, string> = {
  fr: "Français",
  en: "English",
  es: "Español",
  ar: "العربية",
};

export function LocaleSwitcher() {
  const t = useTranslations("localeSwitcher");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onChange(nextLocale: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <label className="inline-flex items-center" title={NATIVE_NAMES[locale]}>
      <span className="sr-only">{t("label")}</span>
      <Select
        aria-label={t("label")}
        value={locale}
        disabled={isPending}
        onChange={(event) => onChange(event.target.value as Locale)}
        compact
      >
        {locales.map((value) => (
          <option key={value} value={value} title={NATIVE_NAMES[value]}>
            {value.toUpperCase()}
          </option>
        ))}
      </Select>
    </label>
  );
}
