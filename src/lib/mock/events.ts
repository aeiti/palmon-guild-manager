import type {
  ContributionEntry,
  EventType,
  GuildEvent,
} from "@/lib/game/event";

/** Minimal upcoming-event shape for the Dashboard; `startsAt` is
 * server-authoritative (UTC−2). */
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

/**
 * Rich event instances (one per type) for the /events screen. Values track
 * docs/game-data.md §4 where observed: Guild Hunt total damage 1.878T /
 * 50B threshold at trap Lvl 10, MVP αειτι; Guild Clash Diamond #8 with
 * 1,523,448,922.
 */
export const MOCK_EVENTS: GuildEvent[] = [
  {
    id: "e-hunt",
    type: "guildHunt",
    title: "Subterranean Lizard — Lvl 10",
    startsAt: hrs(-6),
    status: "live",
    fields: {
      boss: "Subterranean Lizard",
      trapLevel: 10,
      totalDamage: 1_878_914_700_235,
      threshold: 50_000_000_000,
      mvpMemberId: "m-aeiti",
    },
  },
  {
    id: "e-sandstorm",
    type: "sandstorm",
    title: "Sandstorm Scuffle — Squad A",
    startsAt: hrs(26),
    status: "upcoming",
    opponent: "WAR",
    fields: {
      squad: "A",
      guildPoints: 0,
      opponentPoints: 0,
      result: "pending",
    },
  },
  {
    id: "e-duel",
    type: "guildDuel",
    title: "Guild Duel — Week",
    startsAt: hrs(3),
    status: "live",
    opponent: "RotR",
    fields: { us: 9, them: 0, today: "Sat" },
  },
  {
    id: "e-clash",
    type: "guildClash",
    title: "Guild Clash — Season",
    startsAt: hrs(-72),
    status: "live",
    fields: {
      tier: "Diamond",
      rank: 8,
      points: 1_523_448_922,
      week: 2,
    },
  },
  {
    id: "e-pallantis",
    type: "pallantis",
    title: "Clash of Pallantis",
    startsAt: hrs(52),
    status: "upcoming",
    opponent: "Pallantis #37",
    fields: { phase: "battle", result: "pending" },
  },
  {
    id: "e-arctic",
    type: "arcticShowdown",
    title: "Arctic Showdown",
    startsAt: hrs(120),
    status: "upcoming",
    fields: { stage: "registration" },
  },
];

/**
 * Per-member contribution boards, transcribed from the results screens (§5a).
 * Keyed by event id. Guild Clash rolls up from Guild Duel and Arctic Showdown's
 * board isn't captured yet, so neither has a board here.
 */
export const MOCK_CONTRIBUTIONS: Record<string, ContributionEntry[]> = {
  "e-hunt": [
    { memberId: "m-aeiti", value: 421_300_000_000, isMvp: true },
    { memberId: "m-brann", value: 224_400_000_000 },
    { memberId: "m-kitsune", value: 157_400_000_000 },
    { memberId: "m-suvi", value: 130_500_000_000 },
    { memberId: "m-rho", value: 123_700_000_000 },
    { memberId: "m-mira", value: 88_000_000_000 },
    { memberId: "m-yara", value: 61_000_000_000 },
    { memberId: "m-desh", value: 44_500_000_000 },
    { memberId: "m-tovi", value: 30_200_000_000 },
    { memberId: "m-pell", value: 12_600_000_000 },
  ],
  "e-sandstorm": [
    {
      memberId: "m-kitsune",
      value: 2_940_000,
      isMvp: true,
      subScores: { kills: 1_200_000, healing: 900_000, deployment: 840_000 },
    },
    {
      memberId: "m-aeiti",
      value: 2_610_000,
      subScores: { kills: 1_080_000, healing: 810_000, deployment: 720_000 },
    },
    {
      memberId: "m-suvi",
      value: 1_990_000,
      subScores: { kills: 820_000, healing: 640_000, deployment: 530_000 },
    },
    {
      memberId: "m-yara",
      value: 1_400_000,
      subScores: { kills: 560_000, healing: 470_000, deployment: 370_000 },
    },
    {
      memberId: "m-mira",
      value: 1_310_000,
      subScores: { kills: 540_000, healing: 430_000, deployment: 340_000 },
    },
  ],
  "e-duel": [
    { memberId: "m-aeiti", value: 184_200, isMvp: true },
    { memberId: "m-kitsune", value: 171_400 },
    { memberId: "m-brann", value: 142_900 },
    { memberId: "m-rho", value: 98_300 },
    { memberId: "m-mira", value: 76_100 },
    { memberId: "m-yara", value: 54_800 },
  ],
  "e-pallantis": [
    { memberId: "m-kitsune", value: 48_200, isMvp: true },
    { memberId: "m-aeiti", value: 41_900 },
    { memberId: "m-suvi", value: 33_400 },
    { memberId: "m-brann", value: 28_700 },
    { memberId: "m-rho", value: 21_500 },
  ],
};

/** The contributed value for a member in an event, or undefined if none. */
export function getContribution(
  eventId: string,
  memberId: string,
): number | undefined {
  return MOCK_CONTRIBUTIONS[eventId]?.find((e) => e.memberId === memberId)
    ?.value;
}
