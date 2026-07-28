import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { getLatestFxRates } from "@/lib/currency/get-latest-rates";
import { convertCents } from "@/lib/currency/convert";
import { psychologicalRoundCents } from "@/lib/currency/psychological-round";
import { formatMoney } from "@/lib/currency/format-money";
import { BASE_CURRENCY } from "@/lib/currency/constants";

// Illustrative base price for the conversion demo below (not tied to a
// seeded product/variant, which don't exist yet).
const SAMPLE_BASE_PRICE_CENTS = 1999; // $19.99

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const [t, currency, rates] = await Promise.all([
    getTranslations("home"),
    getPreferredCurrency(),
    getLatestFxRates(),
  ]);

  const convertedPrice = rates
    ? psychologicalRoundCents(
        currency === BASE_CURRENCY
          ? SAMPLE_BASE_PRICE_CENTS
          : convertCents(SAMPLE_BASE_PRICE_CENTS, rates[currency])
      )
    : null;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-black/70 dark:text-white/70">
          {t("subtitle")}
        </p>
      </div>

      <div className="rounded-lg border border-black/10 p-6 dark:border-white/20">
        <h2 className="font-semibold">{t("priceDemoTitle")}</h2>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          {t("priceDemoDescription")}
        </p>
        <p className="mt-4 text-2xl font-bold">
          {convertedPrice !== null
            ? formatMoney(convertedPrice, currency, locale)
            : t("ratesUnavailable")}
        </p>
      </div>
    </div>
  );
}
