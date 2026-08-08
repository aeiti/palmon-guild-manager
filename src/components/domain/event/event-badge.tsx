import { cn } from "@/lib/utils";
import { EVENT_LABEL, EVENT_SHORT, type EventType } from "@/lib/game/event";
import { EventTypeIcon } from "./event-type-icon";

/** Icon + label pill for an event type (docs/components.md §3.4). */
export function EventBadge({
  type,
  short = false,
  className,
}: {
  type: EventType;
  short?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border-2 bg-surface-2 px-2 py-0.5 font-mono text-xs uppercase tracking-wide text-text-2",
        className,
      )}
    >
      <EventTypeIcon type={type} className="size-3.5" />
      {short ? EVENT_SHORT[type] : EVENT_LABEL[type]}
    </span>
  );
}
