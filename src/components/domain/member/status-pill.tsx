import { cn } from "@/lib/utils";
import type { ActivityTier } from "@/lib/game/types";

/**
 * Derived activity tier (docs/components.md §3.1) — never hand-set; comes from
 * the last-seen bucket via activityFromBucket(). State colours are legitimate
 * here (§1.1: green/amber/red = state).
 */
const TIER: Record<ActivityTier, { label: string; dot: string; text: string }> =
  {
    active: { label: "Active", dot: "bg-good", text: "text-good" },
    idle: { label: "Idle", dot: "bg-warn", text: "text-warn" },
    inactive: { label: "Inactive", dot: "bg-bad", text: "text-bad" },
  };

export function StatusPill({
  status,
  className,
}: {
  status: ActivityTier;
  className?: string;
}) {
  const { label, dot, text } = TIER[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide",
        text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dot)} />
      {label}
    </span>
  );
}
