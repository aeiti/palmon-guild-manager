import type { LastSeenBucket, Member } from "@/lib/game/types";
import type { Stronghold } from "@/lib/game/stronghold";
import type { ContributionEntry, GuildEvent } from "@/lib/game/event";

/**
 * VOID's real guild data, transcribed from the in-game screenshots
 * (docs/screenshots/) plus docs/game-data.md. Roster: 49 members
 * (R5×1 · R4×7 · R3×33 · R2×6 · R1×2). Power/level/last-seen from the
 * Guildmates screens; donations from Rank → Donations (top 8 captured, rest 0);
 * kills, squads, and per-member timezones weren't captured (see game-data §10).
 */
const OBSERVED = "2026-08-08T01:00:00Z";

function bucket(code: string): LastSeenBucket {
  if (code === "on") return { kind: "online" };
  if (code === "1d" || code === "2d")
    return { kind: "days", n: code === "1d" ? 1 : 2 };
  if (code === "3d+") return { kind: "over", days: 3 };
  if (code === "7d+") return { kind: "over", days: 7 };
  if (code === "30d+") return { kind: "over", days: 30 };
  if (code.endsWith("m")) return { kind: "minutes", n: Number(code.slice(0, -1)) };
  if (code.endsWith("h")) return { kind: "hours", n: Number(code.slice(0, -1)) };
  return { kind: "over", days: 30 };
}

// [id, ign, rank, power, level, last-seen code, donations]
type Row = [string, string, 1 | 2 | 3 | 4 | 5, number, number, string, number];

const ROWS: Row[] = [
  // R5
  ["m-kitsune", "Kitsune", 5, 538_692_481, 31, "13m", 1_501_080],
  // R4 (7 of 8)
  ["m-r4unknown", "Potato", 4, 809_114_301, 30, "on", 1_575_660],
  ["m-aeiti", "αειτι", 4, 531_419_837, 31, "on", 0],
  ["m-grim", "GRIM", 4, 460_272_813, 31, "4m", 0],
  ["m-janey", "Janey×³", 4, 498_384_794, 30, "2h", 0],
  ["m-bammbamm", "Bamm-Bamm", 4, 622_625_722, 31, "2h", 1_586_940],
  ["m-siruniballer", "SirUniballer", 4, 379_713_671, 31, "3h", 0],
  ["m-lprdgddss", "Lprdgddss", 4, 439_095_419, 31, "3h", 1_543_860],
  // R3 (33)
  ["m-willdone9", "willdone9", 3, 320_079_546, 30, "on", 0],
  ["m-knownas0", "Kησωηαş0", 3, 532_339_433, 31, "14m", 0],
  ["m-shenh", "ShenH", 3, 470_101_992, 31, "26m", 0],
  ["m-greatvalueash", "Great value Ash", 3, 416_395_024, 27, "27m", 0],
  ["m-hithere", "HiThere", 3, 454_723_861, 31, "47m", 0],
  ["m-valkyrie13", "valkyrie13", 3, 389_249_641, 31, "51m", 1_523_340],
  ["m-ariray", "AriRay", 3, 424_656_459, 31, "51m", 0],
  ["m-hermione", "Hermione", 3, 413_225_598, 30, "1h", 0],
  ["m-warden", "Warden", 3, 464_973_536, 31, "1h", 0],
  ["m-hormuz", "崇Hormuz崇", 3, 422_339_776, 30, "1h", 0],
  ["m-700mandown", "700mandown", 3, 366_819_848, 29, "1h", 0],
  ["m-ixchel", "D. Ixchel", 3, 563_826_028, 31, "2h", 0],
  ["m-jakob", "Jakob", 3, 338_092_622, 29, "2h", 0],
  ["m-bluzuk", "Bluzuk", 3, 470_003_011, 31, "2h", 1_195_320],
  ["m-anon", "anon", 3, 541_737_314, 30, "3h", 0],
  ["m-bramble", "Bramble", 3, 393_814_163, 29, "4h", 0],
  ["m-furkanxp", "Furkanxp", 3, 336_682_030, 31, "4h", 0],
  ["m-mvgda", "mvgda", 3, 497_234_269, 31, "5h", 1_604_280],
  ["m-tonton", "TonTon", 3, 389_800_202, 31, "6h", 0],
  ["m-gon", "Gon", 3, 284_675_841, 26, "7h", 0],
  ["m-xxxtony", "xXxTonyxXx", 3, 242_836_055, 28, "8h", 0],
  ["m-sswwssww", "Sswwssww", 3, 220_652_124, 27, "10h", 0],
  ["m-nasser", "Nasser", 3, 272_622_534, 30, "11h", 0],
  ["m-brazenigris", "Brazen Igris", 3, 369_085_804, 30, "15h", 0],
  ["m-dagnarus", "Dagnarus", 3, 405_016_924, 31, "16h", 0],
  ["m-dylly", "Dylly", 3, 264_120_246, 30, "17h", 0],
  ["m-donseno", "Don_Seno", 3, 216_163_803, 29, "20h", 0],
  ["m-maomao", "Maomao🐙", 3, 350_879_677, 30, "21h", 0],
  ["m-empireof2moro", "Empireof2moro", 3, 220_864_478, 28, "1d", 0],
  ["m-bullseyept", "BullseyePT", 3, 194_449_793, 28, "2d", 0],
  ["m-pikasmash", "PikaSmash", 3, 346_909_175, 30, "2d", 0],
  ["m-lprdgddss69", "Lprdgddss69", 3, 444_960_422, 30, "3d+", 0],
  ["m-frieren", "frieren", 3, 323_737_780, 30, "3d+", 0],
  // R2 (6)
  ["m-noob8899", "Noob8899", 2, 222_889_651, 29, "3d+", 0],
  ["m-suosuo", "Suosuo", 2, 249_658_653, 27, "3d+", 0],
  ["m-ravenblackbane", "RavenBlackbane", 2, 361_924_682, 28, "7d+", 0],
  ["m-testocem", "TestoCem", 2, 370_396_241, 29, "7d+", 1_214_640],
  ["m-nastysilentwind", "NastySilentWind", 2, 242_920_277, 28, "7d+", 0],
  ["m-dlbj18", "Dlbj18", 2, 124_272_362, 28, "7d+", 0],
  // R1 (2)
  ["m-thevoidbear", "The_Void_Bear", 1, 280_339_782, 30, "30d+", 0],
  ["m-duckhunting", "DUCKHUNTING🤪", 1, 293_263_369, 30, "30d+", 0],
];

export const REAL_MEMBERS: Member[] = ROWS.map(
  ([id, ign, rank, power, level, code, donations]) => ({
    id,
    ign,
    guildRank: rank,
    isGuildmaster: rank === 5,
    timezone: "UTC", // per-member timezone not captured
    onlineWindows: [],
    sandstormSquad: null,
    power,
    level,
    rosterStatus: "active",
    lastSeen: bucket(code),
    lastSeenObservedAt: OBSERVED,
    donations,
    kills: 0, // Rank → Kills tab not captured
    notes: undefined,
  }),
);

const hrs = (h: number) => new Date(Date.parse(OBSERVED) + h * 3_600_000).toISOString();

/** VOID's verified portfolio (game-data §3): guardians are real roster members. */
export const REAL_STRONGHOLDS: Stronghold[] = [
  { id: "s-craftsman-6", category: "sanctum", sanctumType: "craftsman", name: "Craftsman Chancel", level: 6, coordX: 485, coordY: 602, occupier: "VOID", deathRate: 20, guardianId: "m-kitsune", governorIds: [null, null], opensAt: hrs(-2), closesAt: hrs(4) },
  { id: "s-goldglade-5", category: "sanctum", sanctumType: "goldglade", name: "Goldglade Shrine", level: 5, coordX: 485, coordY: 712, occupier: "VOID", deathRate: 20, guardianId: "m-mvgda", governorIds: [null, null], opensAt: hrs(3), closesAt: hrs(9) },
  { id: "s-steelstory-4", category: "sanctum", sanctumType: "steelstory", name: "Steelstory Shrine", level: 4, coordX: 354, coordY: 482, occupier: "VOID", deathRate: 20, guardianId: "m-grim", governorIds: [null, null], opensAt: hrs(-1), closesAt: hrs(1) },
  { id: "s-goldglade-4", category: "sanctum", sanctumType: "goldglade", name: "Goldglade Shrine", level: 4, coordX: 354, coordY: 712, occupier: "VOID", deathRate: 20, guardianId: "m-lprdgddss", governorIds: [null, null], opensAt: hrs(20), closesAt: hrs(26) },
  { id: "s-steelstory-3", category: "sanctum", sanctumType: "steelstory", name: "Steelstory Shrine", level: 3, coordX: 207, coordY: 602, occupier: "VOID", deathRate: 20, guardianId: "m-janey", governorIds: [null], opensAt: hrs(-3), closesAt: hrs(6) },
  { id: "s-goldglade-3", category: "sanctum", sanctumType: "goldglade", name: "Goldglade Shrine", level: 3, coordX: 207, coordY: 849, occupier: "VOID", deathRate: 20, guardianId: "m-shenh", governorIds: [null], opensAt: hrs(0.75), closesAt: hrs(7) },
  // Desert Ruins — L3×2, L2×3, L1×1 (coords not captured)
  { id: "r-1", category: "desertRuin", level: 3, coordX: 512, coordY: 640, occupier: "VOID" },
  { id: "r-2", category: "desertRuin", level: 3, coordX: 498, coordY: 655, occupier: "VOID" },
  { id: "r-3", category: "desertRuin", level: 2, coordX: 340, coordY: 470, occupier: "VOID" },
  { id: "r-4", category: "desertRuin", level: 2, coordX: 355, coordY: 690, occupier: "VOID" },
  { id: "r-5", category: "desertRuin", level: 2, coordX: 220, coordY: 610, occupier: "VOID" },
  { id: "r-6", category: "desertRuin", level: 1, coordX: 210, coordY: 830, occupier: "VOID" },
];

export const REAL_EVENTS: GuildEvent[] = [
  { id: "e-hunt", type: "guildHunt", title: "Subterranean Lizard — Lvl 10", startsAt: hrs(-6), status: "live", fields: { boss: "Subterranean Lizard", trapLevel: 10, totalDamage: 1_878_914_700_235, threshold: 50_000_000_000, mvpMemberId: "m-aeiti" } },
  { id: "e-clash", type: "guildClash", title: "Guild Clash — Season", startsAt: hrs(-72), status: "live", fields: { tier: "Diamond", rank: 8, points: 1_523_448_922, week: 2 } },
  { id: "e-duel", type: "guildDuel", title: "Guild Duel — Week", startsAt: hrs(3), status: "live", opponent: "TBD", fields: { us: 9, them: 0, today: "Sat" } },
  { id: "e-sandstorm", type: "sandstorm", title: "Sandstorm Scuffle — Squad A", startsAt: hrs(26), status: "upcoming", fields: { squad: "A", guildPoints: 0, opponentPoints: 0, result: "pending" } },
  { id: "e-pallantis", type: "pallantis", title: "Clash of Pallantis", startsAt: hrs(52), status: "upcoming", fields: { phase: "battle", result: "pending" } },
  { id: "e-arctic", type: "arcticShowdown", title: "Arctic Showdown", startsAt: hrs(120), status: "upcoming", fields: { stage: "registration" } },
];

/** Guild Hunt damage board (game-data §4) — the captured names. */
export const REAL_CONTRIBUTIONS: Record<string, ContributionEntry[]> = {
  "e-hunt": [
    { memberId: "m-aeiti", value: 421_300_000_000, isMvp: true },
    { memberId: "m-lprdgddss", value: 224_400_000_000 },
    { memberId: "m-kitsune", value: 157_400_000_000 },
    { memberId: "m-hormuz", value: 130_500_000_000 },
    { memberId: "m-shenh", value: 123_700_000_000 },
  ],
};
