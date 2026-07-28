import type { ButtonHTMLAttributes } from "react";

// Toggleable filter chip — rectangular by design (see design-system
// constraints: no pill-everywhere), a small square swatch corner marks the
// pressed state instead of relying on color alone.
export function Tag({
  pressed,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={
        "relative h-9 border px-3 text-sm transition-colors duration-(--duration-base) ease-(--ease-standard) " +
        (pressed
          ? "border-neutral-900 bg-neutral-900 text-neutral-0"
          : "border-neutral-300 text-neutral-700 hover:border-neutral-900") +
        ` ${className}`
      }
      {...props}
    >
      {children}
    </button>
  );
}
