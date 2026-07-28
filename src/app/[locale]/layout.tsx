import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Geist, Geist_Mono } from "next/font/google";
import { routing, getDirection, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartTrigger } from "@/components/cart/CartTrigger";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/seo/site";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { getCart } from "@/lib/cart/get-cart";
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
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: `%s — ${t("title")}` },
  };
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

  const [currency, t, navT, cart] = await Promise.all([
    getPreferredCurrency(),
    getTranslations({ locale, namespace: "common" }),
    getTranslations({ locale, namespace: "nav" }),
    getCart(locale as Locale),
  ]);

  return (
    <html lang={locale} dir={getDirection(locale as Locale)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <JsonLd data={organizationSchema()} />
        <NextIntlClientProvider>
          <CartProvider initialCart={cart}>
            <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/20">
              <div className="flex items-center gap-6">
                <Link href="/" className="font-semibold">
                  {t("brand")}
                </Link>
                <nav className="flex items-center gap-4 text-sm">
                  <Link href="/products">{navT("products")}</Link>
                  <Link href="/search">{navT("search")}</Link>
                </nav>
              </div>
              <div className="flex items-center gap-4">
                <LocaleSwitcher />
                <CurrencySwitcher initialCurrency={currency} />
                <CartTrigger />
              </div>
            </header>
            <main>{children}</main>
            <CartDrawer />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
