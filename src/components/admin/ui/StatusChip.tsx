// Replaces the storefront's colored Badge: a 1px black-bordered rect, no
// color coding. Differentiates terminal-negative statuses (cancelled,
// refunded, failed, expired, ...) from healthy ones via border style
// instead of color: solid = normal lifecycle, dashed = negative.
export function StatusChip({
  children,
  negative = false,
}: {
  children: React.ReactNode;
  negative?: boolean;
}) {
  return (
    <span
      className={
        "inline-flex h-6 items-center border px-2 text-xs font-medium uppercase tracking-wide " +
        (negative ? "border-dashed border-black" : "border-solid border-black")
      }
    >
      {children}
    </span>
  );
}
