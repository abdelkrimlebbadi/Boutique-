import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={
        "h-9 w-full border border-black bg-white px-2.5 text-sm text-black " +
        "placeholder:text-neutral-500 " +
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 " +
        `${className}`
      }
      {...props}
    />
  );
}
