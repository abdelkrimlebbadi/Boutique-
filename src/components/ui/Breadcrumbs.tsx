import { Link } from "@/i18n/navigation";

export function Breadcrumbs({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 lg:mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-1.5">
            {index > 0 && <span aria-hidden>/</span>}
            {index === items.length - 1 ? (
              <span aria-current="page" className="text-neutral-700">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.path || "/"}
                className="transition-colors duration-(--duration-base) hover:text-neutral-900"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
