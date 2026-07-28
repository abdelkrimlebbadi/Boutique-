import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Fraunces, Work_Sans } from "next/font/google";
import { routing, getDirection, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartTrigger } from "@/components/cart/CartTrigger";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { Container } from "@/components/ui/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { organizationSchema } from "@/lib/seo/schema";
import { SITE_URL } from "@/lib/seo/site";
import { getPreferredCurrency } from "@/lib/currency/get-preferred-currency";
import { getCart } from "@/lib/cart/get-cart";
import "./globals.css";

// Two-font editorial system: Fraunces (display/headings — variable optical
// size gives it real character at large sizes) + Work Sans (body/UI).
// Neither font covers Arabic; `ar` content falls back to the OS's default
// Arabic-capable font via the system-ui stack in globals.css.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
        className={`${fraunces.variable} ${workSans.variable} font-body`}
      >
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:start-4 focus-visible:z-50 focus-visible:bg-neutral-900 focus-visible:px-4 focus-visible:py-2 focus-visible:text-neutral-0"
        >
          {t("skipToContent")}
        </a>
        <JsonLd data={organizationSchema()} />
        <NextIntlClientProvider>
          <CartProvider initialCart={cart}>
            <header className="border-b border-neutral-200">
              <Container className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                  <Link
                    href="/"
                    className="font-display text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl"
                  >
                    {t("brand")}
                  </Link>
                  <nav className="hidden items-center gap-6 text-sm sm:flex">
                    <Link
                      href="/products"
                      className="text-neutral-700 transition-colors duration-(--duration-base) hover:text-accent-600"
                    >
                      {navT("products")}
                    </Link>
                    <Link
                      href="/search"
                      className="text-neutral-700 transition-colors duration-(--duration-base) hover:text-accent-600"
                    >
                      {navT("search")}
                    </Link>
                  </nav>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-4">
                  <LocaleSwitcher />
                  <CurrencySwitcher initialCurrency={currency} />
                  <CartTrigger />
                </div>
              </Container>
            </header>
            <main id="main">{children}</main>
            <CartDrawer />
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
