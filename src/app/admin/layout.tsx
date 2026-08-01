import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./admin.css";

// /admin is a fully separate root layout (sibling to [locale], not nested
// under it) — deliberately outside next-intl, French-only, hardcoded
// strings, own <html>/<body>. See src/middleware.ts for the auth
// short-circuit that keeps it out of the storefront's locale routing and
// anonymous-session logic entirely.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  style: ["normal"],
  axes: ["opsz"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Administration — Boutique",
  robots: { index: false, follow: false },
};

// Nothing under /admin is ever statically prerenderable: every page reads
// live, auth-gated business data through the service_role client — none
// of it should be cached or built at compile time, and pages without
// their own dynamic API (searchParams, cookies) would otherwise be
// prerendered at build time (when no real Supabase project is configured
// yet, this fails outright).
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${fraunces.variable} ${workSans.variable} font-body`}>{children}</body>
    </html>
  );
}
