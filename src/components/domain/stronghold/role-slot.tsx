import { Lock, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/game/types";
import { MemberChip } from "@/components/domain/member/member-chip";

export type StrongholdRole = "guardian" | "governor" | "sentry";

const ROLE_LABEL: Record<StrongholdRole, string> = {
  guardian: "Guardian",
  governor: "Governor",
  sentry: "Sentry",
};

/**
 * One stronghold role slot (docs/components.md §3.2). Three states:
 *  - filled: the member chip
 *  - empty: dashed red "+ Assign" (an unfilled slot is a coverage gap)
 *  - locked: greyed "locked — L4+" for a governor slot this level hasn't
 *    unlocked (governor capacity scales with level — §3, game-data §3).
 */
export function RoleSlot({
  role,
  member,
  locked = false,
  canEdit = false,
  className,
}: {
  role: StrongholdRole;
  member?: Member;
  locked?: boolean;
  canEdit?: boolean;
  className?: string;
}) {
  const label = ROLE_LABEL[role];

  if (locked) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-md border border-border bg-surface px-2 py-1.5 opacity-60",
          className,
        )}
      >
        <span className="inline-flex items-center gap-1.5 text-xs text-text-3">
          <Lock className="size-3" />
          locked — L4+
        </span>
        <span className="font-mono text-[0.6rem] uppercase tracking-wide text-text-3">
          {label}
        </span>
      </div>
    );
  }

  if (member) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-2 rounded-md border border-border-2 bg-surface-2 px-2 py-1.5",
          className,
        )}
      >
        <MemberChip member={member} size="sm" />
        <span className="font-mono text-[0.6rem] uppercase tracking-wide text-text-3">
          {label}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={!canEdit}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md border border-dashed border-bad/40 bg-transparent px-2 py-1.5 text-bad transition-colors enabled:hover:bg-bad/10 disabled:cursor-default disabled:opacity-70",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-xs">
        <UserPlus className="size-3" />
        {canEdit ? "Assign" : "Unassigned"}
      </span>
      <span className="font-mono text-[0.6rem] uppercase tracking-wide">
        {label}
      </span>
    </button>
  );
}
