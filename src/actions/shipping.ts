"use server";

import { z } from "zod";
import { getShippingEstimate } from "@/lib/catalog/get-shipping-estimate";

const schema = z.object({
  countryCode: z.string().length(2),
  weightGrams: z.number().int().positive(),
});

export async function getShippingEstimateAction(input: {
  countryCode: string;
  weightGrams: number;
}) {
  const { countryCode, weightGrams } = schema.parse(input);
  return getShippingEstimate(countryCode, weightGrams);
}
