import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 font-body font-medium " +
  "transition-colors duration-(--duration-base) ease-(--ease-standard) " +
  "disabled:cursor-not-allowed disabled:opacity-40";

const variants: Record<Variant, string> = {
  primary:
    "bg-neutral-900 text-neutral-0 hover:bg-accent-600 active:bg-accent-700",
  secondary:
    "border border-neutral-900 text-neutral-900 hover:border-accent-600 hover:text-accent-600",
  ghost: "text-neutral-900 hover:text-accent-600 underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-6 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
