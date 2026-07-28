import Link from "next/link";
import { adminLogout } from "@/actions/admin/auth";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Commandes" },
  { href: "/admin/products", label: "Produits" },
  { href: "/admin/discounts", label: "Codes promo" },
  { href: "/admin/customers", label: "Clients" },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-e border-black">
      <div className="border-b border-black px-4 py-4">
        <span className="font-display text-lg font-semibold">Administration</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border border-transparent px-3 py-2 text-sm transition-colors duration-(--duration-base) ease-(--ease-standard) hover:border-black"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <form action={adminLogout} className="border-t border-black p-3">
        <button
          type="submit"
          className="w-full border border-black px-3 py-2 text-left text-sm transition-colors duration-(--duration-base) hover:bg-black hover:text-white"
        >
          Déconnexion
        </button>
      </form>
    </aside>
  );
}
