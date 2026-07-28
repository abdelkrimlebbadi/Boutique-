import "server-only";

// Printful REST API v1, GET /orders/{id} — confidence: moderate-low, same
// caveat as the rest of this integration: not independently verified
// against live docs in this environment. Deliberately returns the raw
// response rather than parsing deep into a specific shape, so the caller
// (the order detail page's "Actualiser" button) doesn't depend on exact
// field names beyond `result.status`.
export async function getPrintfulOrderStatus(
  printfulOrderId: string
): Promise<{ status: string; raw: unknown }> {
  const apiKey = process.env.PRINTFUL_API_KEY;
  if (!apiKey) throw new Error("PRINTFUL_API_KEY not configured");

  const response = await fetch(`https://api.printful.com/orders/${printfulOrderId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Printful order status fetch failed: ${response.status} ${errorBody}`);
  }

  const body = (await response.json()) as { result: { status?: string } };
  return { status: body.result.status ?? "unknown", raw: body.result };
}
