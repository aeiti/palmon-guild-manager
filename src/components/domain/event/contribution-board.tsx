import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/game/types";
import {
  METRIC_UNIT,
  type ContributionEntry,
  type ContributionMetric,
} from "@/lib/game/event";
import { Metric } from "@/components/domain/data/metric";
import { MemberChip } from "@/components/domain/member/member-chip";

const SUB_LABEL: Record<string, string> = {
  kills: "K",
  healing: "H",
  deployment: "D",
};

/**
 * Ranked per-member contribution for one event (docs/components.md §3.4). The
 * `metric` drives the unit label (damage / points / Temple Points). This is the
 * transcribed participation source, not a guess (§5a).
 */
export function ContributionBoard({
  entries,
  members,
  metric,
  className,
}: {
  entries: ContributionEntry[];
  members: Member[];
  metric: ContributionMetric;
  className?: string;
}) {
  const byId = new Map(members.map((m) => [m.id, m]));
  const sorted = [...entries].sort((a, b) => b.value - a.value);
  const unit = METRIC_UNIT[metric];

  return (
    <div className={cn("space-y-1", className)}>
      {sorted.map((e, i) => {
        const m = byId.get(e.memberId);
        if (!m) return null;
        const rank = i + 1;
        return (
          <div
            key={e.memberId}
            className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-surface-2/50"
          >
            <span
              className={cn(
                "w-5 text-right font-mono text-xs tabular-nums",
                rank <= 3 ? "text-text" : "text-text-3",
              )}
            >
              {rank}
            </span>
            <MemberChip member={m} size="sm" />
            {e.isMvp ? (
              <span className="inline-flex items-center gap-1 rounded border border-border-2 bg-surface-2 px-1 font-mono text-[0.6rem] uppercase text-text-2">
                <Star className="size-2.5" />
                MVP
              </span>
            ) : null}
            <div className="ml-auto text-right">
              <Metric value={e.value} className="text-sm text-text" />
              {e.subScores ? (
                <div className="font-mono text-[0.6rem] text-text-3">
                  {Object.entries(e.subScores)
                    .map(([k, v]) => `${SUB_LABEL[k] ?? k} ${abbr(v)}`)
                    .join(" · ")}
                </div>
              ) : (
                <div className="text-[0.6rem] text-text-3">{unit}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function abbr(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}
