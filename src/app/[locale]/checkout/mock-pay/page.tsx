import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { MockPayButtons } from "@/components/checkout/MockPayButtons";
import { formatMoney } from "@/lib/currency/format-money";
import { isCurrency } from "@/lib/currency/constants";
import type { Locale } from "@/i18n/routing";

// Only reachable when PAYMENT_PROVIDER=mock (see selectPaymentProvider) —
// a real deployment never generates a link to this page.
export default async function MockPayPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    order?: string;
    externalId?: string;
    amountCents?: string;
    currency?: string;
  }>;
}) {
  const { locale } = await params;
  const { order, externalId, amountCents, currency } = await searchParams;
  setRequestLocale(locale as Locale);

  if (process.env.PAYMENT_PROVIDER !== "mock") notFound();
  if (!order || !externalId || !amountCents || !currency || !isCurrency(currency)) notFound();

  const amount = Number(amountCents);
  if (!Number.isFinite(amount)) notFound();

  const t = await getTranslations("checkout.mockPay");

  return (
    <Container className="max-w-md py-12 text-center">
      <h1 className="mb-2 font-display text-2xl font-semibold">{t("title")}</h1>
      <p className="mb-8 text-neutral-600">
        {t("description", { amount: formatMoney(amount, currency, locale) })}
      </p>
      <MockPayButtons
        orderId={order}
        externalId={externalId}
        amountCents={amount}
        currency={currency}
        locale={locale as Locale}
      />
    </Container>
  );
}
