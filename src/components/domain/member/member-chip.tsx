import { cn } from "@/lib/utils";
import type { Member } from "@/lib/game/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RankBadge } from "./rank-badge";

/** Initials for the avatar fallback: first two letters of the IGN, uppercased. */
function initials(ign: string) {
  return ign.slice(0, 2).toUpperCase();
}

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
        <AvatarFallback>{initials(member.ign)}</AvatarFallback>
      </Avatar>
      <span className={cn("truncate text-text", textSize)}>{member.ign}</span>
      {showRank ? (
        <RankBadge rank={member.guildRank} guildmaster={member.isGuildmaster} />
      ) : null}
    </span>
  );
}
