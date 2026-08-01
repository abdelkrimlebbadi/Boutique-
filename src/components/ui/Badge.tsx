import type { ReactNode } from "react";

type Tone = "neutral" | "accent" | "success" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-neutral-900 text-neutral-0",
  accent: "bg-accent-100 text-accent-700",
  success: "bg-neutral-100 text-success-700",
  danger: "bg-neutral-100 text-danger-700",
};

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-6 items-center px-2 text-xs font-medium tracking-wide uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
