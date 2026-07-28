export const CURRENCIES = ["MAD", "EUR", "USD", "GBP"] as const;

export type Currency = (typeof CURRENCIES)[number];

export const BASE_CURRENCY: Currency = "USD";

export const DEFAULT_CURRENCY: Currency = "MAD";

export function isCurrency(value: string): value is Currency {
  return (CURRENCIES as readonly string[]).includes(value);
}
