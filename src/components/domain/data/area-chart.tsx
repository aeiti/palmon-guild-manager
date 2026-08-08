import { cn } from "@/lib/utils";

/**
 * Area chart with a faint grid and emphasised endpoint (docs/components.md
 * §3.5). Inline SVG, responsive via a viewBox. `labels` render under the plot.
 */
export function AreaChart({
  data,
  labels,
  height = 120,
  className,
}: {
  data: number[];
  labels?: string[];
  height?: number;
  className?: string;
}) {
  const W = 320;
  const H = height;
  if (data.length < 2) return null;

  const min = Math.min(...data, 0);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = W / (data.length - 1);
  const y = (v: number) => H - ((v - min) / range) * H;
  const pts = data.map((v, i) => [i * stepX, y(v)] as const);

  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`)
    .join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const last = pts[pts.length - 1];
  const gridYs = [0.25, 0.5, 0.75].map((f) => f * H);

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-auto w-full"
        style={{ height }}
        aria-hidden
      >
        {gridYs.map((gy) => (
          <line
            key={gy}
            x1={0}
            x2={W}
            y1={gy}
            y2={gy}
            className="stroke-border"
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} className="fill-violet/15" />
        <path
          d={line}
          fill="none"
          className="stroke-violet"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={last[0]} cy={last[1]} r={3} className="fill-violet" />
      </svg>
      {labels ? (
        <div className="mt-1 flex justify-between font-mono text-[0.6rem] text-text-3">
          {labels.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
