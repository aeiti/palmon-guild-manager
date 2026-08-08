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

// ---- Contribution metrics (PLAN §5a) ----

export type ContributionMetric = "damage" | "personalPoints" | "templePoints";

export const METRIC_UNIT: Record<ContributionMetric, string> = {
  damage: "damage",
  personalPoints: "points",
  templePoints: "Temple Points",
};

/** Which board (if any) is the participation source for each type (§5a). */
export const EVENT_METRIC: Record<EventType, ContributionMetric | null> = {
  guildHunt: "damage",
  sandstorm: "personalPoints",
  guildDuel: "personalPoints",
  guildClash: null, // rolls up from Guild Duel
  pallantis: "templePoints",
  arcticShowdown: null, // roster/bracket not captured yet
};

// ---- Guild Duel weekday themes (docs/game-data.md §4) ----

export interface DuelDay {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";
  theme: string;
  victoryPoints: number;
}

export const DUEL_THEMES: DuelDay[] = [
  { day: "Mon", theme: "Complete Intel Quests", victoryPoints: 1 },
  { day: "Tue", theme: "Build Up Your Camp", victoryPoints: 2 },
  { day: "Wed", theme: "Research Techs", victoryPoints: 2 },
  { day: "Thu", theme: "Upgrade Palmon", victoryPoints: 2 },
  { day: "Fri", theme: "Prepare for Battle", victoryPoints: 2 },
  { day: "Sat", theme: "Defeat Enemies", victoryPoints: 4 },
];

// ---- Clash of Pallantis phases (docs/game-data.md §4) ----

export type PallantisPhase =
  | "prep"
  | "invasionPrep"
  | "battle"
  | "settlement";

export const PALLANTIS_PHASE_LABEL: Record<PallantisPhase, string> = {
  prep: "Prep",
  invasionPrep: "Invasion Prep",
  battle: "Battle",
  settlement: "Settlement",
};

// ---- Per-type fields (PLAN §4a) ----

export interface GuildHuntFields {
  boss: string; // "Subterranean Lizard"
  trapLevel: number;
  totalDamage: number;
  threshold: number;
  mvpMemberId?: string;
}

export interface SandstormFields {
  squad: "A" | "B";
  guildPoints: number;
  opponentPoints: number;
  result: "win" | "loss" | "pending";
}

export interface GuildDuelFields {
  us: number; // weekly victory-point tally
  them: number;
  today?: DuelDay["day"];
}

export interface GuildClashFields {
  tier: string; // "Diamond"
  rank: number;
  points: number;
  week: number; // 1..4
}

export interface PallantisFields {
  phase: PallantisPhase;
  templePoints?: number;
  result?: "win" | "loss" | "pending";
}

export interface ArcticShowdownFields {
  stage: "registration" | "qualifiers" | "knockout" | "unknown";
  defendersPicked?: number; // 5–30
  placement?: number;
}

// ---- The event record (discriminated union) ----

interface EventBase {
  id: string;
  title: string;
  startsAt: string; // ISO, server-authoritative (UTC−2)
  opponent?: string;
  status: "upcoming" | "live" | "settled";
}

export type GuildEvent =
  | (EventBase & { type: "guildHunt"; fields: GuildHuntFields })
  | (EventBase & { type: "sandstorm"; fields: SandstormFields })
  | (EventBase & { type: "guildDuel"; fields: GuildDuelFields })
  | (EventBase & { type: "guildClash"; fields: GuildClashFields })
  | (EventBase & { type: "pallantis"; fields: PallantisFields })
  | (EventBase & { type: "arcticShowdown"; fields: ArcticShowdownFields });

export interface ContributionEntry {
  memberId: string;
  value: number;
  isMvp?: boolean;
  subScores?: Record<string, number>;
}
