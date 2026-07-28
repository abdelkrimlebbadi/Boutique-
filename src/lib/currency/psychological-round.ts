// Rounds up to the nearest ".99" ending (e.g. 1234 -> 1299, i.e. 12.34 ->
// 12.99; 1200 -> 1299, i.e. an already-round 12.00 also becomes 12.99 rather
// than being rounded down to 11.99). Assumes a 2-decimal minor unit, true
// for all four supported currencies (MAD, EUR, USD, GBP) — would need
// adjusting for a 0-decimal currency such as JPY.
export function psychologicalRoundCents(amountCents: number): number {
  if (amountCents <= 0) return amountCents;
  const wholeUnits = Math.floor(amountCents / 100);
  return wholeUnits * 100 + 99;
}
