import { cn } from "@/lib/utils";
import type { Member } from "@/lib/game/types";
import type { EventType } from "@/lib/game/event";
import { Metric } from "@/components/domain/data/metric";
import { MemberChip } from "@/components/domain/member/member-chip";
import { EventBadge } from "./event-badge";

export interface MatrixEvent {
  id: string;
  type: EventType;
}

/**
 * Members × events, showing contributed VALUES, not ticks (docs/components.md
 * §3.4). Non-participation is a muted dash — so you can see who showed up and
 * how much, not just whether. `getValue` returns the contributed value or
 * undefined.
 */
export function ParticipationMatrix({
  members,
  events,
  getValue,
  className,
}: {
  members: Member[];
  events: MatrixEvent[];
  getValue: (eventId: string, memberId: string) => number | undefined;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-surface-2">
          <tr>
            <th className="border-b border-border px-3 py-2 text-left font-mono text-xs uppercase tracking-wide text-text-3">
              Member
            </th>
            {events.map((e) => (
              <th
                key={e.id}
                className="border-b border-border px-3 py-2 text-right"
              >
                <span className="inline-flex justify-end">
                  <EventBadge type={e.type} short />
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr
              key={m.id}
              className="border-b border-border/60 last:border-0 hover:bg-surface-2/40"
            >
              <td className="px-3 py-2">
                <MemberChip member={m} size="sm" />
              </td>
              {events.map((e) => {
                const v = getValue(e.id, m.id);
                return (
                  <td key={e.id} className="px-3 py-2 text-right">
                    {v != null ? (
                      <Metric value={v} className="text-text-2" />
                    ) : (
                      <span className="text-text-3">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
