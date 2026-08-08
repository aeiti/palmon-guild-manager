import { cn } from "@/lib/utils";
import type { Member } from "@/lib/game/types";
import type { GuildEvent } from "@/lib/game/event";
import { Card, CardBody, CardHead } from "@/components/ui/card";
import { TimePair } from "@/components/domain/time/time-pair";
import { EventBadge } from "./event-badge";
import { EventBody } from "./event-body";

function EventStatus({ status }: { status: GuildEvent["status"] }) {
  const map = {
    live: { text: "text-good", label: "Live", dot: "bg-good" },
    upcoming: { text: "text-text-3", label: "Upcoming", dot: "bg-text-3" },
    settled: { text: "text-text-2", label: "Settled", dot: "bg-text-2" },
  } as const;
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-wide",
        s.text,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

/** Event shell + a per-type body (docs/components.md §3.4). Event time always
 * goes through TimePair (server + local). */
export function EventCard({
  event,
  members,
  className,
}: {
  event: GuildEvent;
  members: Member[];
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHead className="flex-wrap gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <EventBadge type={event.type} />
          <span className="truncate text-sm text-text">{event.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <EventStatus status={event.status} />
          <TimePair serverTime={event.startsAt} />
        </div>
      </CardHead>
      <CardBody>
        <EventBody event={event} members={members} />
      </CardBody>
    </Card>
  );
}
