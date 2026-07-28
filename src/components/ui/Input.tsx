import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={
        "h-11 w-full border border-neutral-300 bg-neutral-0 px-3 text-base text-neutral-900 " +
        "placeholder:text-neutral-500 " +
        "transition-colors duration-(--duration-base) ease-(--ease-standard) " +
        "hover:border-neutral-900 focus-visible:border-accent-600 " +
        `${className}`
      }
      {...props}
    />
  );
}
