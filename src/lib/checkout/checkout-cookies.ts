import "server-only";
import { cookies } from "next/headers";

const SHIPPING_ADDRESS_COOKIE = "checkout_shipping_address_id";
const BILLING_ADDRESS_COOKIE = "checkout_billing_address_id";
const DISCOUNT_CODE_COOKIE = "checkout_discount_code";
const CONTACT_EMAIL_COOKIE = "checkout_contact_email";

const CHECKOUT_COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day — a checkout is a short-lived flow

export async function getCheckoutAddressIds(): Promise<{
  shippingAddressId: string | null;
  billingAddressId: string | null;
}> {
  const store = await cookies();
  return {
    shippingAddressId: store.get(SHIPPING_ADDRESS_COOKIE)?.value ?? null,
    billingAddressId: store.get(BILLING_ADDRESS_COOKIE)?.value ?? null,
  };
}

export async function setCheckoutAddressIds(input: {
  shippingAddressId: string;
  billingAddressId: string | null;
}): Promise<void> {
  const store = await cookies();
  store.set(SHIPPING_ADDRESS_COOKIE, input.shippingAddressId, {
    maxAge: CHECKOUT_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
  });
  if (input.billingAddressId) {
    store.set(BILLING_ADDRESS_COOKIE, input.billingAddressId, {
      maxAge: CHECKOUT_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  } else {
    store.delete(BILLING_ADDRESS_COOKIE);
  }
}

export async function getCheckoutDiscountCode(): Promise<string | null> {
  const store = await cookies();
  return store.get(DISCOUNT_CODE_COOKIE)?.value ?? null;
}

export async function setCheckoutDiscountCode(code: string | null): Promise<void> {
  const store = await cookies();
  if (code) {
    store.set(DISCOUNT_CODE_COOKIE, code, {
      maxAge: CHECKOUT_COOKIE_MAX_AGE,
      sameSite: "lax",
      path: "/",
    });
  } else {
    store.delete(DISCOUNT_CODE_COOKIE);
  }
}

export async function getCheckoutContactEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(CONTACT_EMAIL_COOKIE)?.value ?? null;
}

export async function setCheckoutContactEmail(email: string): Promise<void> {
  const store = await cookies();
  store.set(CONTACT_EMAIL_COOKIE, email, {
    maxAge: CHECKOUT_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
  });
}

export async function clearCheckoutCookies(): Promise<void> {
  const store = await cookies();
  store.delete(SHIPPING_ADDRESS_COOKIE);
  store.delete(BILLING_ADDRESS_COOKIE);
  store.delete(DISCOUNT_CODE_COOKIE);
  store.delete(CONTACT_EMAIL_COOKIE);
}
