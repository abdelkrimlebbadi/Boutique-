// Only countries with a seeded shipping_zones row can ever produce a
// shipping quote — offering anything else in the address form would just
// dead-end at NO_SHIPPING_RATE. Keep in sync with supabase/seed.sql's
// shipping_zones.country_codes. Native-language labels, same convention as
// ShippingEstimate.tsx's COUNTRIES list.
export const SUPPORTED_COUNTRIES = [
  { code: "MA", label: "Maroc" },
  { code: "FR", label: "France" },
  { code: "ES", label: "España" },
  { code: "DE", label: "Deutschland" },
  { code: "BE", label: "België / Belgique" },
  { code: "NL", label: "Nederland" },
  { code: "IT", label: "Italia" },
  { code: "PT", label: "Portugal" },
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
] as const;

export type SupportedCountryCode = (typeof SUPPORTED_COUNTRIES)[number]["code"];
