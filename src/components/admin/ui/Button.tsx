import type { ButtonHTMLAttributes } from "react";

// One variant only: white bg, black 1px border, black text. Hover
// inverts (black bg, white text) — the only state change beyond the
// border, since the brief rules out any filled/colored "primary" identity.
export function Button({
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";
  return (
    <button
      className={
        "inline-flex items-center justify-center gap-2 border border-black bg-white font-body font-medium text-black " +
        "transition-colors duration-(--duration-base) ease-(--ease-standard) " +
        "hover:bg-black hover:text-white " +
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-black " +
        `${sizeClass} ${className}`
      }
      {...props}
    />
  );
}
