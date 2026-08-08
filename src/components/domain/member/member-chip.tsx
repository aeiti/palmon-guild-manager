import { cn } from "@/lib/utils";
import type { GuildRank, Member } from "@/lib/game/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RankBadge } from "./rank-badge";

/** Initials for the avatar fallback: first two letters of the IGN, uppercased. */
function initials(ign: string) {
  return ign.slice(0, 2).toUpperCase();
}

/**
 * Initials-fallback tint by guild rank, echoing the rank ramp (R5 amber … R1
 * grey). Only shows when there's no avatar image; keeps the same rank read as
 * the RankBadge so a member's colour is consistent across the app.
 */
const RANK_FALLBACK: Record<GuildRank, string> = {
  5: "bg-rank-5/15 text-rank-5",
  4: "bg-rank-4/15 text-rank-4",
  3: "bg-rank-3/15 text-rank-3",
  2: "bg-rank-2/15 text-rank-2",
  1: "bg-rank-1/15 text-rank-1",
};

/**
 * The one way a member is referenced anywhere (docs/components.md §3.1):
 * avatar + IGN, optionally the rank badge.
 */
export function MemberChip({
  member,
  size = "md",
  showRank = false,
  className,
}: {
  member: Pick<
    Member,
    "ign" | "avatarUrl" | "guildRank" | "isGuildmaster"
  >;
  size?: "sm" | "md";
  showRank?: boolean;
  className?: string;
}) {
  const avatarSize = size === "sm" ? "size-6" : "size-8";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Avatar className={avatarSize}>
        {member.avatarUrl ? (
          <AvatarImage src={member.avatarUrl} alt={member.ign} />
        ) : null}
        <AvatarFallback className={RANK_FALLBACK[member.guildRank]}>
          {initials(member.ign)}
        </AvatarFallback>
      </Avatar>
      <span className={cn("truncate text-text", textSize)}>{member.ign}</span>
      {showRank ? (
        <RankBadge rank={member.guildRank} guildmaster={member.isGuildmaster} />
      ) : null}
    </span>
  );
}
