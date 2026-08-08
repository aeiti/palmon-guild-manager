import { cn } from "@/lib/utils";

/**
 * Tiny trend line with an emphasised endpoint (docs/components.md §3.5). Inline
 * SVG, no deps. Stroke stays uniform via non-scaling-stroke.
 */
export function Sparkline({
  data,
  width = 120,
  height = 32,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map(
    (v, i) => [i * stepX, height - ((v - min) / range) * height] as const,
  );
  const d = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const last = pts[pts.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      preserveAspectRatio="none"
      className={cn("overflow-visible", className)}
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        className="stroke-violet"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} className="fill-violet" />
    </svg>
  );
}
