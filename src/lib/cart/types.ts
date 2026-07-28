import type { Currency } from "@/lib/currency/constants";

export type CartItemView = {
  id: string;
  variantId: string;
  quantity: number;
  sku: string;
  size: string | null;
  color: string | null;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  imageAlt: string | null;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type CartView = {
  id: string | null;
  currency: Currency;
  items: CartItemView[];
  itemCount: number;
  subtotalCents: number;
};

export const EMPTY_CART = (currency: Currency): CartView => ({
  id: null,
  currency,
  items: [],
  itemCount: 0,
  subtotalCents: 0,
});
