import type { Currency } from "@/lib/currency/constants";

export type SortOption = "newest" | "price_asc" | "price_desc";

export type ProductFilters = {
  category?: string;
  color?: string;
  size?: string;
  // Bounds are expressed in the visitor's currently selected display
  // currency's minor units (cents).
  minPriceCents?: number;
  maxPriceCents?: number;
};

export type ProductCardView = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  imageAlt: string | null;
  colors: string[];
  sizes: string[];
  priceCents: number;
  currency: Currency;
  isBestseller: boolean;
};

export type ProductListResult = {
  items: ProductCardView[];
  nextCursor: string | null;
};

export type CategoryView = {
  id: string;
  slug: string;
  name: string;
};
