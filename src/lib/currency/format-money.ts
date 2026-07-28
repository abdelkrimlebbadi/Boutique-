import type { Currency } from "./constants";

export function formatMoney(
  amountCents: number,
  currency: Currency,
  locale: string
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}
