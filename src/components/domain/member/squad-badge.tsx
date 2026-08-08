import { cn } from "@/lib/utils";
import type { Squad } from "@/lib/game/types";

/**
 * Skirmish Squad A / B (docs/components.md §3.1). `null` renders an em dash,
 * NOT "None" — unassigned is absence of data, shown as a muted dash.
 */
export function SquadBadge({
  squad,
  className,
}: {
  squad: Squad;
  className?: string;
}) {
  if (squad === null) {
    return <span className={cn("font-mono text-text-3", className)}>—</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-border-2 bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-text-2",
        className,
      )}
    >
      Squad {squad}
    </span>
  );
}
