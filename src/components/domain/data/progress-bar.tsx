import { cn } from "@/lib/utils";

type Variant = "violet" | "good" | "warn" | "bad" | "desert";

const FILL: Record<Variant, string> = {
  violet: "bg-violet",
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
  desert: "bg-desert",
};

/** Proportional bar (docs/components.md §3.5). Clamps to 0–100%. */
export function ProgressBar({
  value,
  max,
  variant = "violet",
  className,
}: {
  value: number;
  max: number;
  variant?: Variant;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, (value / (max || 1)) * 100));
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-2",
        className,
      )}
    >
      <div className={cn("h-full", FILL[variant])} style={{ width: `${pct}%` }} />
    </div>
  );
}
