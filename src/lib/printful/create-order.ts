import "server-only";

// Printful REST API v1 orders endpoint. Confidence: moderate-high on the
// general shape (this is Printful's long-stable, well-documented order
// creation payload) — not independently verified against live docs in
// this environment, so treat field names as a strong best effort rather
// than a guarantee.

export type PrintfulAddress = {
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  countryCode: string;
  phone: string | null;
};

export type PrintfulOrderItem = {
  printfulVariantId: string;
  quantity: number;
  retailPriceCents: number;
  currency: string;
  printFileUrl?: string | null;
};

export type CreatePrintfulOrderParams = {
  externalOrderNumber: string;
  contactEmail: string;
  recipient: PrintfulAddress;
  items: PrintfulOrderItem[];
};

export async function createPrintfulOrder(
  params: CreatePrintfulOrderParams
): Promise<{ printfulOrderId: string }> {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) throw new Error("PRINTFUL_API_KEY not configured");

  const response = await fetch("https://api.printful.com/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: params.externalOrderNumber,
      confirm: true,
      recipient: {
        name: params.recipient.fullName,
        address1: params.recipient.line1,
        address2: params.recipient.line2 ?? undefined,
        city: params.recipient.city,
        state_code: params.recipient.state ?? undefined,
        country_code: params.recipient.countryCode,
        zip: params.recipient.postalCode,
        phone: params.recipient.phone ?? undefined,
        email: params.contactEmail,
      },
      items: params.items.map((item) => ({
        variant_id: item.printfulVariantId,
        quantity: item.quantity,
        retail_price: (item.retailPriceCents / 100).toFixed(2),
        ...(item.printFileUrl
          ? { files: [{ type: "default", url: item.printFileUrl }] }
          : {}),
      })),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Printful order creation failed: ${response.status} ${errorBody}`);
  }

  const body = (await response.json()) as { result: { id: number } };
  return { printfulOrderId: String(body.result.id) };
}
