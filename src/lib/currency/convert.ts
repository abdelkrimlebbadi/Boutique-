// Converts an amount in cents (in the base currency, USD) to cents in the
// quote currency using a rate expressed as 1 base unit = `rate` quote units.
export function convertCents(baseAmountCents: number, rate: number): number {
  return Math.round(baseAmountCents * rate);
}
