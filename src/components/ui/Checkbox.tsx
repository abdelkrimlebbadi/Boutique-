import type { InputHTMLAttributes } from "react";

export function Checkbox({
  label,
  className = "",
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const inputId = id ?? props.name;
  return (
    <label className="flex items-start gap-2 text-sm text-neutral-700">
      <input
        type="checkbox"
        id={inputId}
        className={`mt-0.5 h-4 w-4 shrink-0 border border-neutral-300 accent-neutral-900 ${className}`}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
