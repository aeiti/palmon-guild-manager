import { cn } from "@/lib/utils";
import type { ScoreTerm } from "@/lib/metrics";

/**
 * The weighted composite score (docs/components.md §3.8). Presentational — the
 * arithmetic + weights live in lib/metrics.ts. `breakdown` expands the weighted
 * terms so the number is never a black box.
 */
export function ContributionScore({
  score,
  breakdown,
  size = "md",
  className,
}: {
  score: number;
  breakdown?: ScoreTerm[];
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const scoreSize =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-mono font-semibold tabular-nums text-text",
            scoreSize,
          )}
        >
          {score}
        </span>
        <span className="font-mono text-xs text-text-3">/100</span>
      </div>
      {breakdown ? (
        <div className="space-y-0.5">
          {breakdown.map((t) => (
            <div
              key={t.label}
              className="flex items-center gap-2 text-[0.6rem]"
            >
              <span className="w-24 shrink-0 text-text-3">{t.label}</span>
              <div className="h-1 flex-1 overflow-hidden rounded bg-surface-2">
                <div
                  className="h-full bg-violet"
                  style={{ width: `${t.normalized * 100}%` }}
                />
              </div>
              <span className="w-6 text-right font-mono tabular-nums text-text-2">
                {Math.round(t.points)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
