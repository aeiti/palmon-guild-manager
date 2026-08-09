import "dotenv/config";
import { db } from "@/lib/db";
import {
  events,
  guildWeeklySnapshot,
  members,
  participation,
  strongholds,
  users,
} from "@/lib/db/schema";
import { EVENT_METRIC } from "@/lib/game/event";
import {
  REAL_CONTRIBUTIONS,
  REAL_EVENTS,
  REAL_MEMBERS,
  REAL_STRONGHOLDS,
} from "@/lib/db/seed-data";
import {
  AVG_POWER_TREND,
  DONATIONS_TREND,
  KILLS_TREND,
  ROSTER_SIZE_TREND,
  SANDSTORM_POINTS_TREND,
  TREND_WEEKS,
} from "@/lib/mock/trends";

/**
 * Populate Neon from the mock data. Idempotent — clears the seeded tables first,
 * so it can be re-run. Run with: npm run db:seed
 */
async function main() {
  // Clear in FK-safe order.
  await db.delete(participation);
  await db.delete(events);
  await db.delete(strongholds);
  await db.delete(guildWeeklySnapshot);
  await db.delete(members);
  await db.delete(users);

  // App users derived from the roster: aeiti is Admin (env), R4/R5 → Officer.
  const userIdByMember = new Map<string, string>();
  const userRows: (typeof users.$inferInsert)[] = REAL_MEMBERS.map((m) => {
    const id = crypto.randomUUID();
    userIdByMember.set(m.id, id);
    const role =
      m.id === "m-aeiti" ? "admin" : m.guildRank >= 4 ? "officer" : "member";
    const roleSource = m.id === "m-aeiti" ? "env" : "discord";
    return { id, name: m.ign, role, roleSource, rolePinned: false };
  });
  await db.insert(users).values(userRows);

  await db.insert(members).values(
    REAL_MEMBERS.map((m) => ({
      id: m.id,
      userId: userIdByMember.get(m.id) ?? null,
      ign: m.ign,
      guildRank: m.guildRank,
      isGuildmaster: m.isGuildmaster,
      timezone: m.timezone,
      onlineWindows: m.onlineWindows,
      sandstormSquad: m.sandstormSquad,
      power: m.power,
      level: m.level,
      rosterStatus: m.rosterStatus,
      lastSeenBucket: m.lastSeen,
      lastSeenObservedAt: new Date(m.lastSeenObservedAt),
      donations: m.donations,
      kills: m.kills,
      notes: m.notes ?? null,
    })),
  );

  await db.insert(strongholds).values(
    REAL_STRONGHOLDS.map((s) => ({
      id: s.id,
      category: s.category,
      sanctumType: s.sanctumType ?? null,
      name: s.name ?? null,
      level: s.level,
      coordX: s.coordX,
      coordY: s.coordY,
      occupier: s.occupier ?? null,
      deathRate: s.deathRate ?? null,
      guardianId: s.guardianId ?? null,
      governorIds: s.governorIds ?? [],
      opensAt: s.opensAt ? new Date(s.opensAt) : null,
      closesAt: s.closesAt ? new Date(s.closesAt) : null,
      notes: s.notes ?? null,
    })),
  );

  await db.insert(events).values(
    REAL_EVENTS.map((e) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      startsAt: new Date(e.startsAt),
      status: e.status,
      opponent: e.opponent ?? null,
      typeFields: e.fields as unknown as Record<string, unknown>,
    })),
  );

  // Participation rows from the contribution boards.
  const eventTypeById = new Map(REAL_EVENTS.map((e) => [e.id, e.type]));
  const partRows: (typeof participation.$inferInsert)[] = [];
  for (const [eventId, entries] of Object.entries(REAL_CONTRIBUTIONS)) {
    const type = eventTypeById.get(eventId);
    const metric = type ? EVENT_METRIC[type] : null;
    for (const en of entries) {
      partRows.push({
        eventId,
        memberId: en.memberId,
        signedUp: true,
        participated: true,
        metric: metric ?? null,
        value: en.value,
        subScores: en.subScores ?? null,
      });
    }
  }
  await db.insert(participation).values(partRows);

  await db.insert(guildWeeklySnapshot).values(
    TREND_WEEKS.map((w, i) => ({
      week: w,
      weekIndex: i,
      // Round — float products like 1.28*1e9 aren't integers and bigint rejects them.
      donations: Math.round(DONATIONS_TREND[i]),
      kills: Math.round(KILLS_TREND[i]),
      rosterSize: ROSTER_SIZE_TREND[i],
      avgPower: Math.round(AVG_POWER_TREND[i]),
      sandstormPoints: Math.round(SANDSTORM_POINTS_TREND[i]),
    })),
  );

  console.log("Seed complete:", {
    users: userRows.length,
    members: REAL_MEMBERS.length,
    strongholds: REAL_STRONGHOLDS.length,
    events: REAL_EVENTS.length,
    participation: partRows.length,
    snapshots: TREND_WEEKS.length,
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
