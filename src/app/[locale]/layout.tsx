import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { routing, getDirection, type Locale } from "@/i18n/routing";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return { title: t("title") };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale (next-intl recipe).
  setRequestLocale(locale as Locale);

  const [currency, t] = await Promise.all([
    getPreferredCurrency(),
    getTranslations({ locale, namespace: "common" }),
  ]);

  return (
    <html lang={locale} dir={getDirection(locale as Locale)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/20">
            <span className="font-semibold">{t("brand")}</span>
            <div className="flex items-center gap-4">
              <LocaleSwitcher />
              <CurrencySwitcher initialCurrency={currency} />
            </div>
          </header>
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
