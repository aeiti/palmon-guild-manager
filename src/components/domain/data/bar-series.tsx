import { cn } from "@/lib/utils";
import { formatCompact } from "@/lib/format";

export interface Bar {
  label: string;
  value: number;
}

/**
 * Simple vertical bar series (docs/components.md §3.5). Inline SVG bars with
 * html labels underneath; the tallest bar is emphasised.
 */
export function BarSeries({
  data,
  height = 120,
  variant = "violet",
  className,
}: {
  data: Bar[];
  height?: number;
  variant?: "violet" | "desert";
  className?: string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value)) || 1;
  const fill = variant === "desert" ? "fill-desert" : "fill-violet";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-end gap-1" style={{ height }}>
        {data.map((d) => {
          const isMax = d.value === max;
          const h = Math.max(2, (d.value / max) * height);
          return (
            <div
              key={d.label}
              className="flex flex-1 flex-col items-center justify-end"
              title={`${d.label}: ${formatCompact(d.value)}`}
            >
              <svg
                width="100%"
                height={h}
                viewBox="0 0 10 10"
                preserveAspectRatio="none"
                aria-hidden
              >
                <rect
                  x={0}
                  y={0}
                  width={10}
                  height={10}
                  rx={0}
                  className={cn(fill, isMax ? "opacity-100" : "opacity-60")}
                />
              </svg>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-1">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 text-center font-mono text-[0.6rem] text-text-3"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
