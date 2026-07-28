// The one deliberate circular element in the system: a numeral fits a
// circle better than a rectangle at this size, so radius-full is used here
// rather than as a default.
export function CountBadge({ count }: { count: number }) {
  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-600 px-1 text-xs font-medium text-neutral-0">
      {count}
    </span>
  );
}
