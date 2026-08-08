/**
 * Domain types. Mirror the data model in PLAN.md §5 and the mechanics in
 * docs/game-data.md. Kept framework-free so both server and client use them.
 */

export type GuildRank = 1 | 2 | 3 | 4 | 5;

/** Skirmish Squad preference. `null` = unassigned (renders as an em dash). */
export type Squad = "A" | "B" | null;

/** Officer-set roster lifecycle status (distinct from derived activity). */
export type RosterStatus = "active" | "LOA" | "inactive";

/** Derived activity tier — computed from the last-seen bucket, never hand-set. */
export type ActivityTier = "active" | "idle" | "inactive";

/**
 * The game shows a *bucket*, not a timestamp (docs/game-data.md, PLAN §5a).
 * Modelling it as a discriminated union makes it impossible to store a
 * synthesised `lastSeenAt = now − delta`, which is the one design regression to
 * avoid: resolution degrades past ~2 days and caps at "over 30d".
 */
export type LastSeenBucket =
  | { kind: "online" }
  | { kind: "minutes"; n: number }
  | { kind: "hours"; n: number }
  | { kind: "days"; n: 1 | 2 }
  | { kind: "over"; days: 3 | 7 | 30 };

/** A member's usual online window, in their own local time (24h clock). */
export interface OnlineWindow {
  startHour: number; // 0..23
  endHour: number; // 0..23, may wrap past midnight
}

export interface Member {
  id: string;
  ign: string;
  discordId?: string;
  avatarUrl?: string;
  guildRank: GuildRank;
  isGuildmaster: boolean;
  timezone: string; // IANA, e.g. "America/Los_Angeles"
  onlineWindows: OnlineWindow[];
  sandstormSquad: Squad;
  power: number;
  level: number;
  rosterStatus: RosterStatus;
  lastSeen: LastSeenBucket;
  lastSeenObservedAt: string; // ISO — when the bucket was captured
  donations: number;
  kills: number;
  notes?: string;
}
