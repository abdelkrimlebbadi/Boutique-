import "server-only";

// PayPal Orders API v2 — REST, no SDK (matches the project's "no heavy
// dependency" posture). OAuth2 client-credentials token is cached
// in-memory for the life of the process; a cold start just re-fetches it,
// which is fine for the request volumes this store expects.

let cachedToken: { value: string; expiresAt: number } | null = null;

// Trailing slash/whitespace on PAYPAL_API_BASE (an easy copy-paste mistake
// in a secrets UI, and invisible once saved) would otherwise double up the
// leading slash on every path built below and 404 against PayPal's edge.
function getApiBase(): string {
  const base = process.env.PAYPAL_API_BASE ?? "https://api-m.sandbox.paypal.com";
  return base.trim().replace(/\/+$/, "");
}

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not configured");
  }

  const url = `${getApiBase()}/v1/oauth2/token`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`PayPal OAuth token request failed: ${response.status}`);
  }

  const body = (await response.json()) as { access_token: string; expires_in: number };
  // Refresh a little early to avoid racing expiry.
  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in - 60) * 1000,
  };
  return cachedToken.value;
}

export async function paypalFetch<T>(
  path: string,
  init: { method: string; body?: unknown }
): Promise<T> {
  const token = await getAccessToken();
  const response = await fetch(`${getApiBase()}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`PayPal API ${init.method} ${path} failed: ${response.status} ${errorBody}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
