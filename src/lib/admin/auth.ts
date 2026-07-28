import "server-only";
import { createClient } from "@/lib/supabase/server";
import { decodeJwtPayload } from "./decode-jwt";

export type AdminSession = { userId: string };

// getUser() forces server-side revalidation against Supabase's Auth
// server (proves the session is genuine); getSession() then reads the
// already-validated cookie's raw access token so its `user_role` claim
// (set by the custom_access_token_hook) can be read.
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;

  const claims = decodeJwtPayload(session.access_token);
  return claims.user_role === "admin" ? { userId: user.id } : null;
}

// Called at the top of every admin Server Action and every admin page —
// defense in depth alongside the middleware gate, since a Server Action is
// an independently invocable network endpoint the middleware matcher
// doesn't (and shouldn't have to) reason about.
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error("Admin access required");
  return session;
}
