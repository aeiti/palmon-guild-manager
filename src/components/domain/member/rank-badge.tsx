import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuildRank } from "@/lib/game/types";

/**
 * In-game rank R1–R5 (docs/components.md §3.1). Rendered as a mono chip with a
 * brightness ramp for hierarchy rather than the reserved semantic hues — violet
 * stays "interactive" and amber stays "state" (§1.1). Guildmaster adds a crown,
 * a TITLE marker, not a permission (§3, PLAN §3).
 *
 * Deliberately distinct from AppRoleBadge (§5.4): rank is a bare "R4", app role
 * is an icon + word. The two axes diverge (an R4 can hold Admin).
 */
const RANK_STYLE: Record<GuildRank, string> = {
  5: "border-text-3/70 bg-surface-2 text-text font-semibold",
  4: "border-border-2 bg-surface-2 text-text",
  3: "border-border-2 bg-surface text-text-2",
  2: "border-border bg-surface text-text-2",
  1: "border-border bg-surface text-text-3",
};

export function RankBadge({
  rank,
  guildmaster = false,
  className,
}: {
  rank: GuildRank;
  guildmaster?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-xs tabular-nums",
        RANK_STYLE[rank],
        className,
      )}
      title={guildmaster ? "Guildmaster" : `Rank ${rank}`}
    >
      {guildmaster ? <Crown className="size-3" /> : null}
      R{rank}
    </span>
  );
}
