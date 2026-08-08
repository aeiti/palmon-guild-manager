import * as React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type Accent = "text" | "violet" | "desert" | "good" | "warn" | "bad";

const ACCENT: Record<Accent, string> = {
  text: "text-text",
  violet: "text-violet",
  desert: "text-desert",
  good: "text-good",
  warn: "text-warn",
  bad: "text-bad",
};

/**
 * Dashboard / KPI tile (docs/components.md §3.5). `value` is a node so callers
 * pass a <Metric/> (or a badge, a DeltaIndicator, etc.); `spark` is a slot for
 * a sparkline once the chart set lands.
 */
export function StatTile({
  label,
  value,
  unit,
  foot,
  accent = "text",
  spark,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  unit?: React.ReactNode;
  foot?: React.ReactNode;
  accent?: Accent;
  spark?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-text-3">
          {label}
        </span>
        {spark}
      </div>
      <div
        className={cn(
          "mt-2 flex items-baseline gap-1 text-2xl font-semibold tabular-nums",
          ACCENT[accent],
        )}
      >
        {value}
        {unit ? (
          <span className="text-sm font-normal text-text-3">{unit}</span>
        ) : null}
      </div>
      {foot ? <div className="mt-1 text-xs text-text-3">{foot}</div> : null}
    </Card>
  );
}
