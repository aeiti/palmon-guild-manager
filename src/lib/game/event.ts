/**
 * Event taxonomy (docs/game-data.md §4, PLAN §4a). The six guild events. Kept
 * minimal for now — the event set (EventTypeIcon, EventBody.*, contribution
 * boards) builds on this.
 */

export type EventType =
  | "guildHunt"
  | "sandstorm"
  | "guildDuel"
  | "guildClash"
  | "pallantis"
  | "arcticShowdown";

export const EVENT_LABEL: Record<EventType, string> = {
  guildHunt: "Guild Hunt",
  sandstorm: "Sandstorm Scuffle",
  guildDuel: "Guild Duel",
  guildClash: "Guild Clash",
  pallantis: "Clash of Pallantis",
  arcticShowdown: "Arctic Showdown",
};

/** Short label for tight spaces. */
export const EVENT_SHORT: Record<EventType, string> = {
  guildHunt: "Hunt",
  sandstorm: "Sandstorm",
  guildDuel: "Duel",
  guildClash: "Clash",
  pallantis: "Pallantis",
  arcticShowdown: "Arctic",
};
