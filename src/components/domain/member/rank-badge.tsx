import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuildRank } from "@/lib/game/types";

/**
 * In-game rank R1–R5 (docs/components.md §3.1), coloured to match the game:
 * R5 amber, R4 violet, R3 blue, R2 green, R1 grey. This is the ONE sanctioned
 * exception to the §1.1 colour rules — it uses dedicated `rank-*` tokens so the
 * reserved --violet/--desert keep their meaning elsewhere. Guildmaster adds a
 * crown, a TITLE marker, not a permission (§3, PLAN §3).
 *
 * Still distinct from AppRoleBadge (§5.4): rank is a coloured bare "R4", app
 * role is a neutral icon + word. The two axes diverge (an R4 can hold Admin).
 */
const RANK_STYLE: Record<GuildRank, string> = {
  5: "border-rank-5/40 bg-rank-5/10 text-rank-5",
  4: "border-rank-4/40 bg-rank-4/10 text-rank-4",
  3: "border-rank-3/40 bg-rank-3/10 text-rank-3",
  2: "border-rank-2/40 bg-rank-2/10 text-rank-2",
  1: "border-rank-1/40 bg-rank-1/10 text-rank-1",
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
