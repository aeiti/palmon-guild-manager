import * as React from "react";
import { cn } from "@/lib/utils";

export interface DistributionSegment {
  key: string;
  label: React.ReactNode;
  value: number;
  /** Tailwind bg-* class for the segment fill. */
  color: string;
}

/**
 * A single stacked proportional bar with a legend (docs/components.md §3.5) —
 * the R5→R1 rank distribution on the Dashboard. Segments size by value.
 */
export function DistributionBar({
  segments,
  className,
}: {
  segments: DistributionSegment[];
  className?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex h-3 overflow-hidden rounded-full bg-surface-2">
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.key}
              className={cn("h-full", s.color)}
              style={{ width: `${(s.value / total) * 100}%` }}
              title={`${s.label}: ${s.value}`}
            />
          ) : null,
        )}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((s) => (
          <span
            key={s.key}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-text-2"
          >
            <span className={cn("size-2 rounded-full", s.color)} />
            {s.label}
            <span className="tabular-nums text-text-3">{s.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
