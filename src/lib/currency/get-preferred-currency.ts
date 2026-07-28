import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_CURRENCY, isCurrency, type Currency } from "./constants";

export const CURRENCY_COOKIE_NAME = "NEXT_CURRENCY";

export async function getPreferredCurrency(): Promise<Currency> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
  return value && isCurrency(value) ? value : DEFAULT_CURRENCY;
}
