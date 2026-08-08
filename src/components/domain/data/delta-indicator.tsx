import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMetric, type MetricFormat } from "@/lib/format";

export type DeltaDirection = "up" | "down" | "flat";

/**
 * ▲/▼ change indicator (docs/components.md §3.5). `inverted` flips the good/bad
 * colouring for metrics where lower is better (e.g. Guild Clash rank).
 */
export function DeltaIndicator({
  value,
  direction,
  inverted = false,
  format = "compact",
  className,
}: {
  value: number;
  direction: DeltaDirection;
  inverted?: boolean;
  format?: MetricFormat;
  className?: string;
}) {
  const Icon =
    direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

  const isGood =
    direction === "flat" ? null : inverted ? direction === "down" : direction === "up";
  const color =
    isGood === null ? "text-text-3" : isGood ? "text-good" : "text-bad";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-xs tabular-nums",
        color,
        className,
      )}
    >
      <Icon className="size-3" />
      {formatMetric(Math.abs(value), format)}
    </span>
  );
}
