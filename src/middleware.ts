import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { decodeJwtPayload } from "@/lib/admin/decode-jwt";

const handleI18nRouting = createIntlMiddleware(routing);

const ADMIN_PUBLIC_PATHS = new Set(["/admin/login", "/admin/setup"]);

// /admin lives outside next-intl entirely (no locale prefix, French-only)
// and needs a real authenticated staff session with the `admin` role
// claim — never the anonymous cart session ensureSupabaseSession()
// creates for storefront visitors. This is a separate code path, not just
// a matcher exclusion, because it also has to perform its own auth
// check/redirect (the Edge runtime can't import server-only helpers like
// src/lib/admin/auth.ts, so the Supabase client is built inline here, same
// pattern as ensureSupabaseSession below).
async function handleAdminRequest(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  if (ADMIN_PUBLIC_PATHS.has(pathname)) return response;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

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
    // Temporary diagnostic query param on each bounce, to tell apart "no
    // session reached the middleware at all" (cookie propagation) from
    // "session present but missing the admin claim" (access token hook) —
    // remove once the live login issue is resolved.
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login?reason=no-session", request.url));
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const claims = session ? decodeJwtPayload(session.access_token) : {};
    if (claims.user_role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login?reason=no-admin-claim", request.url));
    }

    return response;
  } catch (error) {
    console.error("handleAdminRequest failed:", error);
    return NextResponse.redirect(new URL("/admin/login?reason=middleware-error", request.url));
  }
}

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
  const { pathname } = request.nextUrl;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return handleAdminRequest(request);
  }

  const response = handleI18nRouting(request);
  await ensureSupabaseSession(request, response);
  return response;
}

export const config = {
  // Skip Next internals, API routes and any path with a file extension
  // (static assets served from /public).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
