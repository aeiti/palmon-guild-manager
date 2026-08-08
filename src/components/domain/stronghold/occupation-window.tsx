"use client";

import { cn } from "@/lib/utils";
import { useNow } from "@/lib/use-now";

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
}

/**
 * Occupation window (docs/components.md §3.2, §3.3) — open/closed state with a
 * live countdown to the next transition. Takeovers are scheduled affairs, so
 * "opens in" matters. Renders "—" until mounted (no hydration mismatch).
 */
export function OccupationWindow({
  opensAt,
  closesAt,
  className,
}: {
  opensAt: string;
  closesAt: string;
  className?: string;
}) {
  const now = useNow();
  if (!now) {
    return (
      <span className={cn("font-mono text-xs text-text-3", className)}>—</span>
    );
  }

  const t = now.getTime();
  const o = new Date(opensAt).getTime();
  const c = new Date(closesAt).getTime();

  let label: string;
  let color: string;
  let remain: number | null;
  if (t < o) {
    label = "Opens in";
    remain = o - t;
    color = "text-text-2";
  } else if (t < c) {
    label = "Open · closes in";
    remain = c - t;
    color = "text-good";
  } else {
    label = "Closed";
    remain = null;
    color = "text-text-3";
  }

  return (
    <span
      className={cn("font-mono text-xs tabular-nums", color, className)}
      title={`Opens ${new Date(opensAt).toLocaleString("en-GB")} · closes ${new Date(closesAt).toLocaleString("en-GB")}`}
    >
      {label}
      {remain != null ? ` ${formatDuration(remain)}` : ""}
    </span>
  );
}
