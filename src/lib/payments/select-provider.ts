import "server-only";
import { MockProvider } from "./mock-provider";
import { PayPalProvider } from "@/lib/paypal/provider";
import { YouCanPayProvider } from "@/lib/youcan-pay/provider";
import type { PaymentProvider, PaymentProviderName } from "./types";

// The ONLY place in the codebase allowed to know which concrete provider
// backs a given order. Server Actions and pages must depend on
// PaymentProvider (types.ts) and this function, never import
// PayPalProvider/YouCanPayProvider/MockProvider directly.
export function getPaymentProviderByName(name: PaymentProviderName): PaymentProvider {
  switch (name) {
    case "mock":
      return new MockProvider();
    case "youcan_pay":
      return new YouCanPayProvider();
    case "paypal":
      return new PayPalProvider();
  }
}

// An env override takes priority (e.g. forcing `mock` in dev/demo),
// otherwise Moroccan shipping addresses go through YouCan Pay (the
// domestic gateway) and everything else through PayPal.
export function getPaymentProviderName(shippingCountryCode: string): PaymentProviderName {
  const override = process.env.PAYMENT_PROVIDER as PaymentProviderName | undefined;
  return override ?? (shippingCountryCode.toUpperCase() === "MA" ? "youcan_pay" : "paypal");
}

export function selectPaymentProvider(shippingCountryCode: string): PaymentProvider {
  return getPaymentProviderByName(getPaymentProviderName(shippingCountryCode));
}
