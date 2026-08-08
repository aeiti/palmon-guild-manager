import type { EventType } from "@/lib/game/event";

/** Minimal upcoming-event shape for the Dashboard; the full Event model lands
 * with the event set. `startsAt` is server-authoritative (UTC−2). */
export interface UpcomingEvent {
  id: string;
  type: EventType;
  title: string;
  startsAt: string; // ISO
}

const now = Date.now();
const hrs = (h: number) => new Date(now + h * 3_600_000).toISOString();

export const MOCK_UPCOMING_EVENTS: UpcomingEvent[] = [
  { id: "e-duel", type: "guildDuel", title: "Guild Duel — Defeat Enemies", startsAt: hrs(3) },
  { id: "e-sandstorm", type: "sandstorm", title: "Sandstorm — Squad A", startsAt: hrs(26) },
  { id: "e-pallantis", type: "pallantis", title: "Clash of Pallantis — Battle", startsAt: hrs(52) },
  { id: "e-hunt", type: "guildHunt", title: "Guild Hunt — Lvl 11 trap", startsAt: hrs(73) },
];
