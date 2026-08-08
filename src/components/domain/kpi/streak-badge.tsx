import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Participation streak (docs/components.md §3.8) — consecutive events a member
 * contributed to. Active (ongoing) reads good; a broken/zero streak is muted.
 * Sourced from participation history, so it means "showed up", not "logged in".
 */
export function StreakBadge({
  count,
  active,
  className,
}: {
  count: number;
  active: boolean;
  className?: string;
}) {
  if (count === 0) {
    return (
      <span className={cn("font-mono text-xs text-text-3", className)}>—</span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-xs tabular-nums",
        active
          ? "border-good/30 bg-good/10 text-good"
          : "border-border-2 bg-surface-2 text-text-3",
        className,
      )}
      title={active ? `${count}-event streak` : `broken (was ${count})`}
    >
      <Flame className="size-3" />
      {count}
    </span>
  );
}
