import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

// Every visitor needs a session (anonymous or real) before any cart/RLS-scoped
// query can work: carts.customer_id = auth.uid(). This runs after the i18n
// routing decision so the resulting response (redirect or rewrite) carries
// both the locale cookie and the Supabase session cookies in one round trip.
async function ensureSupabaseSession(
  request: NextRequest,
  response: NextResponse
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return; // no Supabase project linked yet

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      await supabase.auth.signInAnonymously();
    }
  } catch (error) {
    console.error("ensureSupabaseSession failed:", error);
  }
}

export default async function middleware(request: NextRequest) {
  const response = handleI18nRouting(request);
  await ensureSupabaseSession(request, response);
  return response;
}

export const config = {
  // Skip Next internals, API routes and any path with a file extension
  // (static assets served from /public).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
