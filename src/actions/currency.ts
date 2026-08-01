"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { CURRENCIES } from "@/lib/currency/constants";
import { CURRENCY_COOKIE_NAME } from "@/lib/currency/get-preferred-currency";

const setPreferredCurrencySchema = z.enum(CURRENCIES);

export async function setPreferredCurrency(currency: string) {
  const parsed = setPreferredCurrencySchema.parse(currency);
  const cookieStore = await cookies();

  cookieStore.set(CURRENCY_COOKIE_NAME, parsed, {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    path: "/",
  });
}
