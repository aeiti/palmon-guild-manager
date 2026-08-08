import * as React from "react";
import { cn } from "@/lib/utils";
import type { EventType } from "@/lib/game/event";

/** Text-colour utility per event type — the categorical palette from §1.1. */
export const EVENT_TEXT_COLOR: Record<EventType, string> = {
  guildHunt: "text-event-hunt",
  sandstorm: "text-event-sandstorm",
  guildDuel: "text-event-duel",
  guildClash: "text-event-clash",
  pallantis: "text-event-pallantis",
  arcticShowdown: "text-event-arctic",
};

/** Border + tint + text for a chip, per event type. */
export const EVENT_CHIP: Record<EventType, string> = {
  guildHunt: "border-event-hunt/30 bg-event-hunt/10 text-event-hunt",
  sandstorm: "border-event-sandstorm/30 bg-event-sandstorm/10 text-event-sandstorm",
  guildDuel: "border-event-duel/30 bg-event-duel/10 text-event-duel",
  guildClash: "border-event-clash/30 bg-event-clash/10 text-event-clash",
  pallantis: "border-event-pallantis/30 bg-event-pallantis/10 text-event-pallantis",
  arcticShowdown: "border-event-arctic/30 bg-event-arctic/10 text-event-arctic",
};

/** Hand-drawn glyphs — the event icons carry game meaning Lucide doesn't. */
const GLYPH: Record<EventType, React.ReactNode> = {
  // Trap reticle — the Subterranean Lizard trap.
  guildHunt: (
    <>
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  // Swirling funnel.
  sandstorm: (
    <>
      <path d="M4 6h15" />
      <path d="M6 10h12" />
      <path d="M8 14h8" />
      <path d="M10 18h5" />
    </>
  ),
  // Crossed swords.
  guildDuel: (
    <>
      <path d="M6 6l8.5 8.5" />
      <path d="M18 6l-8.5 8.5" />
      <path d="M4.5 17.5l3-3" />
      <path d="M19.5 17.5l-3-3" />
    </>
  ),
  // Trophy.
  guildClash: (
    <>
      <path d="M7 4h10v3a5 5 0 0 1-10 0z" />
      <path d="M7 5H4.5a1.5 1.5 0 0 0 0 3H6" />
      <path d="M17 5h2.5a1.5 1.5 0 0 1 0 3H18" />
      <path d="M12 12v4" />
      <path d="M8.5 19h7" />
    </>
  ),
  // Temple.
  pallantis: (
    <>
      <path d="M3 9l9-6 9 6" />
      <path d="M5 9v10M9 9v10M15 9v10M19 9v10" />
      <path d="M3 19h18" />
    </>
  ),
  // Snowflake.
  arcticShowdown: (
    <>
      <path d="M12 2v20" />
      <path d="M4 7l16 10" />
      <path d="M20 7L4 17" />
      <path d="M12 6l2 2M12 6l-2 2M12 18l2-2M12 18l-2-2" />
    </>
  ),
};

/** One icon per event type, defined once (docs/components.md §3.4). */
export function EventTypeIcon({
  type,
  colored = true,
  className,
}: {
  type: EventType;
  colored?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", colored && EVENT_TEXT_COLOR[type], className)}
      aria-hidden
    >
      {GLYPH[type]}
    </svg>
  );
}
