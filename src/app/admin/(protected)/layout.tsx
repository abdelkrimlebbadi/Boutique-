import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { Sidebar } from "@/components/admin/layout/Sidebar";

// Belt-and-braces alongside the middleware gate (src/middleware.ts): a
// Server Component render is a separate trust boundary from middleware,
// and this is cheap insurance against ever wiring up a route under
// (protected) that the middleware matcher somehow misses.
export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin().catch(() => null);
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-x-auto p-6">{children}</main>
    </div>
  );
}
