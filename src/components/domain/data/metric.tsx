import { cn } from "@/lib/utils";
import { formatFull, formatMetric, type MetricFormat } from "@/lib/format";

/**
 * The single number renderer (docs/components.md §3.5). Compact by default,
 * full precision in the native tooltip (§5.6). Always tabular mono.
 */
export function Metric({
  value,
  format = "compact",
  unit,
  className,
}: {
  value: number;
  format?: MetricFormat;
  unit?: string;
  className?: string;
}) {
  const display = formatMetric(value, format, unit);
  const full =
    format === "compact"
      ? `${formatFull(value)}${unit ?? ""}`
      : display;
  return (
    <span
      className={cn("font-mono tabular-nums", className)}
      title={full}
    >
      {display}
    </span>
  );
}
