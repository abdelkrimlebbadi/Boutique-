export type RankedBarListItem = { label: string; value: number; secondaryLabel?: string };

export function RankedBarList({
  items,
  valueFormatter = (value: number) => String(Math.round(value)),
}: {
  items: RankedBarListItem[];
  valueFormatter?: (value: number) => string;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">Aucune donnée sur cette période.</p>;
  }

  const max = Math.max(1, ...items.map((item) => item.value));

  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, index) => {
        const pct = (item.value / max) * 100;
        return (
          <li key={index} className="flex items-center gap-3 text-sm">
            <span className="w-5 shrink-0 text-right tabular-nums text-neutral-500">
              {index + 1}
            </span>
            <span className="w-40 shrink-0 truncate">{item.label}</span>
            <svg viewBox="0 0 100 8" preserveAspectRatio="none" className="h-2 flex-1 text-black">
              <rect x={0} y={0} width={pct} height={8} fill="none" stroke="currentColor" strokeWidth={1} />
            </svg>
            <span className="w-24 shrink-0 text-right tabular-nums">{valueFormatter(item.value)}</span>
            {item.secondaryLabel && (
              <span className="w-16 shrink-0 text-right tabular-nums text-neutral-500">
                {item.secondaryLabel}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
