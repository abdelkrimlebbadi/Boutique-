import type { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={
        "h-9 border border-black bg-white px-2 text-sm text-black " +
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 " +
        `${className}`
      }
      {...props}
    >
      {children}
    </select>
  );
}
