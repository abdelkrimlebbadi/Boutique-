import type { SelectHTMLAttributes } from "react";

// Native <select>: full keyboard support and screen-reader semantics for
// free, no custom listbox to reimplement. `compact` is a real variant (not
// a className override) because Tailwind utility conflicts are resolved by
// generated CSS rule order, not by source order in a className string —
// appending "ps-2 pe-5" after "ps-3 pe-8" would not reliably win.
export function Select({
  compact = false,
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { compact?: boolean }) {
  return (
    <select
      className={
        "h-10 border border-neutral-300 bg-neutral-0 text-sm text-neutral-900 " +
        (compact ? "w-20 ps-2 pe-5 " : "ps-3 pe-8 ") +
        "transition-colors duration-(--duration-base) ease-(--ease-standard) " +
        "hover:border-neutral-900 focus-visible:border-accent-600 " +
        `${className}`
      }
      {...props}
    >
      {children}
    </select>
  );
}
