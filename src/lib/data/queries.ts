import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  events as eventsTable,
  guildWeeklySnapshot,
  members as membersTable,
  participation,
  strongholds as strongholdsTable,
  users as usersTable,
} from "@/lib/db/schema";
import type {
  GuildRank,
  LastSeenBucket,
  Member,
  OnlineWindow,
  Squad,
} from "@/lib/game/types";
import type { Stronghold } from "@/lib/game/stronghold";
import type { ContributionEntry, GuildEvent } from "@/lib/game/event";
import type { AppUser } from "@/lib/mock/users";

/**
 * The server-side data-access layer. Pages import these (never the raw db) and
 * get domain shapes back, so components don't change when the source moves from
 * mock to Postgres.
 */

type MemberRow = typeof membersTable.$inferSelect;
type StrongholdRow = typeof strongholdsTable.$inferSelect;
type EventRow = typeof eventsTable.$inferSelect;

function toMember(r: MemberRow): Member {
  return {
    id: r.id,
    discordId: r.discordId ?? undefined,
    ign: r.ign,
    guildRank: r.guildRank as GuildRank,
    isGuildmaster: r.isGuildmaster,
    timezone: r.timezone ?? "UTC",
    onlineWindows: (r.onlineWindows ?? []) as OnlineWindow[],
    sandstormSquad: (r.sandstormSquad ?? null) as Squad,
    // bigint columns arrive from the driver as strings; coerce so arithmetic
    // (e.g. avg power) adds instead of concatenating.
    power: Number(r.power ?? 0),
    level: r.level ?? 1,
    rosterStatus: r.rosterStatus,
    lastSeen: (r.lastSeenBucket ?? { kind: "over", days: 30 }) as LastSeenBucket,
    lastSeenObservedAt: (r.lastSeenObservedAt ?? new Date()).toISOString(),
    donations: Number(r.donations ?? 0),
    kills: Number(r.kills ?? 0),
    notes: r.notes ?? undefined,
  };
}

function toStronghold(r: StrongholdRow): Stronghold {
  return {
    id: r.id,
    category: r.category,
    sanctumType: r.sanctumType ?? undefined,
    name: r.name ?? undefined,
    level: r.level,
    coordX: r.coordX,
    coordY: r.coordY,
    occupier: r.occupier ?? undefined,
    deathRate: r.deathRate ?? undefined,
    guardianId: r.guardianId ?? null,
    governorIds: (r.governorIds ?? []) as (string | null)[],
    sentryIds: (r.sentryIds ?? []) as (string | null)[],
    opensAt: r.opensAt?.toISOString(),
    closesAt: r.closesAt?.toISOString(),
    notes: r.notes ?? undefined,
  };
}

function toEvent(r: EventRow): GuildEvent {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    startsAt: r.startsAt.toISOString(),
    status: r.status as GuildEvent["status"],
    opponent: r.opponent ?? undefined,
    fields: (r.typeFields ?? {}) as never,
  } as GuildEvent;
}

export async function getMembers(): Promise<Member[]> {
  const rows = await db.select().from(membersTable);
  return rows.map(toMember).sort((a, b) => b.power - a.power);
}

export async function getStrongholds(): Promise<Stronghold[]> {
  const rows = await db.select().from(strongholdsTable);
  return rows.map(toStronghold);
}

export async function getEvents(): Promise<GuildEvent[]> {
  const rows = await db.select().from(eventsTable).orderBy(asc(eventsTable.startsAt));
  return rows.map(toEvent);
}

/** Contribution boards keyed by event id; MVP = the event's top scorer. */
export async function getContributionsMap(): Promise<
  Record<string, ContributionEntry[]>
> {
  const rows = await db.select().from(participation);
  const byEvent: Record<string, ContributionEntry[]> = {};
  for (const r of rows) {
    (byEvent[r.eventId] ??= []).push({
      memberId: r.memberId,
      value: r.value ?? 0,
      subScores: (r.subScores ?? undefined) as
        | Record<string, number>
        | undefined,
    });
  }
  for (const list of Object.values(byEvent)) {
    list.sort((a, b) => b.value - a.value);
    if (list[0]) list[0].isMvp = true;
  }
  return byEvent;
}

export interface WeeklySnapshot {
  week: string;
  donations: number;
  kills: number;
  rosterSize: number;
  avgPower: number;
  sandstormPoints: number;
}

export async function getWeeklySnapshots(): Promise<WeeklySnapshot[]> {
  const rows = await db
    .select()
    .from(guildWeeklySnapshot)
    .orderBy(asc(guildWeeklySnapshot.weekIndex));
  return rows.map((r) => ({
    week: r.week,
    donations: Number(r.donations ?? 0),
    kills: Number(r.kills ?? 0),
    rosterSize: r.rosterSize ?? 0,
    avgPower: Number(r.avgPower ?? 0),
    sandstormPoints: Number(r.sandstormPoints ?? 0),
  }));
}

/** App users joined to their roster member, for the Admin page. */
export async function getAppUsers(): Promise<{
  users: AppUser[];
  members: Member[];
}> {
  const [userRows, memberRows] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(membersTable),
  ]);
  const memberByUserId = new Map(
    memberRows.filter((m) => m.userId).map((m) => [m.userId as string, m.id]),
  );
  const users: AppUser[] = userRows
    .map((u) => {
      const memberId = memberByUserId.get(u.id);
      if (!memberId) return null;
      return {
        id: u.id,
        memberId,
        role: u.role,
        source: u.roleSource,
      };
    })
    .filter((x): x is AppUser => x !== null);
  return { users, members: memberRows.map(toMember) };
}
