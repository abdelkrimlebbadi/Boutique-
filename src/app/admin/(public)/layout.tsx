// No auth check here (deliberately — this wraps /admin/login and
// /admin/setup, the two paths middleware lets through unauthenticated;
// see ADMIN_PUBLIC_PATHS in src/middleware.ts). The (protected) route
// group's layout is where requireAdmin() lives.
export default function AdminPublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm border border-black p-6">{children}</div>
    </div>
  );
}
