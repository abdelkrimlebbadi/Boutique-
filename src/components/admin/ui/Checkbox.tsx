import type { InputHTMLAttributes } from "react";

// Native checkbox, styled minimally via accent-color — browser-native
// rendering is acceptably stroke-only here and avoids inventing an icon
// asset for a single checkmark.
export function Checkbox({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={`h-4 w-4 border border-black accent-black ${className}`}
      {...props}
    />
  );
}
