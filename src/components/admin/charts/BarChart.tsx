// Pure SVG, no dependency, stroke-only (fill="none") per the admin design
// brief. Server-Component-compatible: no hooks, no interactivity, just
// computed markup — usable from either a Server or Client Component.

export type BarChartDatum = { label: string; value: number };

function niceMax(max: number, steps: number): number {
  if (max <= 0) return steps;
  const rough = max / steps;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / magnitude;
  const niceStep = residual > 5 ? 10 : residual > 2 ? 5 : residual > 1 ? 2 : 1;
  return niceStep * magnitude * steps;
}

export function BarChart({
  data,
  width = 720,
  height = 240,
  valueFormatter = (value: number) => String(Math.round(value)),
  gridLines = 4,
}: {
  data: BarChartDatum[];
  width?: number;
  height?: number;
  valueFormatter?: (value: number) => string;
  gridLines?: number;
}) {
  const marginLeft = 56;
  const marginRight = 8;
  const marginTop = 8;
  const marginBottom = 24;
  const innerWidth = width - marginLeft - marginRight;
  const innerHeight = height - marginTop - marginBottom;

  const rawMax = Math.max(1, ...data.map((d) => d.value));
  const max = niceMax(rawMax, gridLines);
  const barSlot = data.length > 0 ? innerWidth / data.length : innerWidth;
  const barWidth = Math.max(1, barSlot * 0.6);
  const showEvery = data.length <= 14 ? 1 : Math.ceil(data.length / 14);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full text-black" role="img">
      {Array.from({ length: gridLines + 1 }).map((_, index) => {
        const value = (max / gridLines) * index;
        const y = marginTop + innerHeight - (value / max) * innerHeight;
        return (
          <g key={index}>
            <line
              x1={marginLeft}
              y1={y}
              x2={marginLeft + innerWidth}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.25}
              strokeWidth={1}
            />
            <text
              x={marginLeft - 8}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fill="currentColor"
            >
              {valueFormatter(value)}
            </text>
          </g>
        );
      })}

      {data.map((datum, index) => {
        const barHeight = max > 0 ? (datum.value / max) * innerHeight : 0;
        const x = marginLeft + index * barSlot + (barSlot - barWidth) / 2;
        const y = marginTop + innerHeight - barHeight;
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
            />
            {index % showEvery === 0 && (
              <text
                x={x + barWidth / 2}
                y={marginTop + innerHeight + 14}
                textAnchor="middle"
                fontSize={10}
                fill="currentColor"
              >
                {datum.label}
              </text>
            )}
          </g>
        );
      })}

      <line
        x1={marginLeft}
        y1={marginTop + innerHeight}
        x2={marginLeft + innerWidth}
        y2={marginTop + innerHeight}
        stroke="currentColor"
        strokeWidth={1}
      />
    </svg>
  );
}
