import { z } from "zod";

// line2/state/phone are `.nullable()` (not `.optional()`): every producer
// of an AddressInput (the checkout form, the DB snapshot in orders) always
// sets these keys explicitly, even when null — keeping `undefined` out of
// the type avoids a three-way null/undefined split downstream (Printful's
// recipient payload and the confirmation email template both expect
// `string | null`).
export const addressSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).nullable(),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().max(120).nullable(),
  postalCode: z.string().trim().min(1).max(20),
  countryCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2}$/, "Code pays ISO 3166-1 alpha-2 requis"),
  phone: z.string().trim().max(30).nullable(),
});

export type AddressInput = z.infer<typeof addressSchema>;
