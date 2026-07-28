export type JwtClaims = Record<string, unknown> & { user_role?: string };

// Decodes (does NOT verify) a JWT's payload segment. Safe only because the
// token always comes from a Supabase session that @supabase/ssr's
// getUser() has already validated server-side against Supabase's Auth
// server first — this just reads claims already proven authentic, it must
// never be used to establish trust on its own.
export function decodeJwtPayload(accessToken: string): JwtClaims {
  const payload = accessToken.split(".")[1];
  if (!payload) return {};
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  try {
    return JSON.parse(atob(padded));
  } catch {
    return {};
  }
}
