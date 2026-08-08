import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import type { LastSeenBucket, OnlineWindow } from "@/lib/game/types";

/**
 * Drizzle schema (PLAN §5). Auth.js adapter tables (user/account/session/
 * verificationToken) extended with app role + Discord id, plus the domain
 * tables. History tables are append-only so trends accrue from day one.
 */

// ---- Enums ----
export const appRoleEnum = pgEnum("app_role", ["admin", "officer", "member"]);
export const roleSourceEnum = pgEnum("role_source", [
  "discord",
  "env",
  "pinned",
]);
export const rosterStatusEnum = pgEnum("roster_status", [
  "active",
  "LOA",
  "inactive",
]);
export const strongholdCategoryEnum = pgEnum("stronghold_category", [
  "sanctum",
  "desertRuin",
]);
export const sanctumTypeEnum = pgEnum("sanctum_type", [
  "goldglade",
  "woodsong",
  "steelstory",
  "craftsman",
  "scholar",
]);
export const eventTypeEnum = pgEnum("event_type", [
  "guildHunt",
  "sandstorm",
  "guildDuel",
  "guildClash",
  "pallantis",
  "arcticShowdown",
]);

// ---- Auth.js tables (extended) ----
export const users = pgTable("user", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text(),
  email: text().unique(),
  emailVerified: timestamp({ mode: "date" }),
  image: text(),
  // App-specific (PLAN §3): permission role is independent of in-game rank.
  discordId: text().unique(),
  role: appRoleEnum().notNull().default("member"),
  roleSource: roleSourceEnum().notNull().default("discord"),
  rolePinned: boolean().notNull().default(false),
});

export const accounts = pgTable(
  "account",
  {
    userId: text()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text().$type<AdapterAccountType>().notNull(),
    provider: text().notNull(),
    providerAccountId: text().notNull(),
    refresh_token: text(),
    access_token: text(),
    expires_at: integer(),
    token_type: text(),
    scope: text(),
    id_token: text(),
    session_state: text(),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable("session", {
  sessionToken: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp({ mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text().notNull(),
    token: text().notNull(),
    expires: timestamp({ mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// ---- Domain: roster ----
export const members = pgTable("member", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  discordId: text().unique(),
  userId: text().references(() => users.id, { onDelete: "set null" }),
  ign: text().notNull(),
  guildRank: integer().notNull().default(1),
  isGuildmaster: boolean().notNull().default(false),
  timezone: text(),
  onlineWindows: jsonb().$type<OnlineWindow[]>().default([]),
  sandstormSquad: text(), // 'A' | 'B' | null
  power: bigint({ mode: "number" }).default(0),
  level: integer().default(1),
  rosterStatus: rosterStatusEnum().notNull().default("active"),
  // Stored bucket + capture time — NEVER a synthesised datetime (PLAN §5a).
  lastSeenBucket: jsonb().$type<LastSeenBucket>(),
  lastSeenObservedAt: timestamp({ mode: "date" }),
  donations: bigint({ mode: "number" }).default(0),
  kills: bigint({ mode: "number" }).default(0),
  notes: text(),
  createdAt: timestamp({ mode: "date" }).defaultNow(),
  updatedAt: timestamp({ mode: "date" }).defaultNow(),
});

// ---- Domain: events ----
export const events = pgTable("event", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: eventTypeEnum().notNull(),
  title: text().notNull(),
  startsAt: timestamp({ mode: "date" }).notNull(),
  status: text().notNull().default("upcoming"),
  opponent: text(),
  // Typed per §4a — kept as jsonb so each event type carries its own shape.
  typeFields: jsonb().$type<Record<string, unknown>>().default({}),
  createdAt: timestamp({ mode: "date" }).defaultNow(),
});

export const participation = pgTable("participation", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text()
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  memberId: text()
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  signedUp: boolean().notNull().default(false),
  participated: boolean().notNull().default(false),
  squad: text(), // Sandstorm only
  metric: text(), // damage | personalPoints | templePoints
  value: bigint({ mode: "number" }).default(0),
  subScores: jsonb().$type<Record<string, number>>(),
  createdAt: timestamp({ mode: "date" }).defaultNow(),
});

// ---- Domain: strongholds ----
export const strongholds = pgTable("stronghold", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  category: strongholdCategoryEnum().notNull(),
  sanctumType: sanctumTypeEnum(),
  name: text(),
  level: integer().notNull().default(1),
  coordX: integer().notNull(),
  coordY: integer().notNull(),
  occupier: text(),
  deathRate: integer(),
  guardianId: text(), // member id (app-enforced; avoids self-FK)
  governorIds: jsonb().$type<(string | null)[]>().default([]),
  sentryIds: jsonb().$type<(string | null)[]>().default([]),
  opensAt: timestamp({ mode: "date" }),
  closesAt: timestamp({ mode: "date" }),
  notes: text(),
  updatedAt: timestamp({ mode: "date" }).defaultNow(),
});

// ---- History (append-only) ----
export const participationHistory = pgTable("participation_history", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text().notNull(),
  memberId: text().notNull(),
  value: bigint({ mode: "number" }).default(0),
  capturedAt: timestamp({ mode: "date" }).defaultNow(),
});

export const donationHistory = pgTable("donation_history", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  memberId: text().notNull(),
  value: bigint({ mode: "number" }).default(0),
  period: text(), // e.g. "2026-W32"
  capturedAt: timestamp({ mode: "date" }).defaultNow(),
});

export const killHistory = pgTable("kill_history", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  memberId: text().notNull(),
  value: bigint({ mode: "number" }).default(0),
  period: text(),
  capturedAt: timestamp({ mode: "date" }).defaultNow(),
});

export const rankChangeLog = pgTable("rank_change_log", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  memberId: text().notNull(),
  fromRank: integer(),
  toRank: integer(),
  power: bigint({ mode: "number" }),
  changedAt: timestamp({ mode: "date" }).defaultNow(),
});

export const strongholdHistory = pgTable("stronghold_history", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  strongholdId: text().notNull(),
  change: jsonb().$type<Record<string, unknown>>(),
  capturedAt: timestamp({ mode: "date" }).defaultNow(),
});

export const guildClashHistory = pgTable("guild_clash_history", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  week: integer().notNull(),
  tier: text(),
  rank: integer(),
  points: bigint({ mode: "number" }).default(0),
  capturedAt: timestamp({ mode: "date" }).defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  actorUserId: text(),
  action: text().notNull(),
  target: text(),
  detail: jsonb().$type<Record<string, unknown>>(),
  at: timestamp({ mode: "date" }).defaultNow(),
});
