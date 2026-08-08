/**
 * Stronghold mechanics as data (docs/game-data.md §3). Deriving EXP/h and buffs
 * from (category, type, level) keeps them checkable against the screenshots and
 * means the dashboard totals can't drift from the detail cards.
 */

export type StrongholdCategory = "sanctum" | "desertRuin";

export type SanctumType =
  | "goldglade"
  | "woodsong"
  | "steelstory"
  | "craftsman"
  | "scholar";

export type BuffType =
  | "gold"
  | "lumber"
  | "steel"
  | "harvesting"
  | "construction"
  | "research";

export interface Buff {
  type: BuffType;
  value: number; // percent
}

export interface Stronghold {
  id: string;
  category: StrongholdCategory;
  sanctumType?: SanctumType; // sanctum only
  name?: string; // e.g. "Goldglade Shrine"
  level: number; // sanctum 1–6, ruin 1–3
  coordX: number;
  coordY: number;
  occupier?: string; // guild tag
  deathRate?: number; // sanctum, percent
  guardianId?: string | null; // sanctum
  governorIds?: (string | null)[]; // sanctum; length = capacity for level
  sentryIds?: (string | null)[]; // sanctum; 0..5
  opensAt?: string; // ISO
  closesAt?: string; // ISO
  notes?: string;
}

/** EXP/h by level (docs/game-data.md §3). Index by level (1-based). */
const SANCTUM_EXP = [0, 200, 400, 600, 900, 1200, 1500];
const RUIN_EXP = [0, 300, 600, 900];

export function expPerHour(s: Pick<Stronghold, "category" | "level">): number {
  const table = s.category === "sanctum" ? SANCTUM_EXP : RUIN_EXP;
  return table[s.level] ?? 0;
}

/** Buff % by level: L1–L5 = 3/5/10/15/20; L6 = flat 20 specialty. */
const BUFF_SCALE = [0, 3, 5, 10, 15, 20, 20];
export function buffScaleByLevel(level: number): number {
  return BUFF_SCALE[level] ?? 0;
}

/**
 * Buffs a sanctum grants, derived from type + level. Resource shrines grant
 * their resource output AND Harvesting at the scaled rate (L1–5); at L6 they
 * grant a flat +20% specialty instead. Craftsman/Scholar grant Construction/
 * Research. Verified: VOID's six sum to Gold+45, Steel+25, Harvesting+70,
 * Construction+20 (docs/game-data.md §3).
 */
export function sanctumBuffs(type: SanctumType, level: number): Buff[] {
  const s = buffScaleByLevel(level);
  const resource = (t: BuffType): Buff[] =>
    level >= 6
      ? [{ type: t, value: 20 }]
      : [
          { type: t, value: s },
          { type: "harvesting", value: s },
        ];
  switch (type) {
    case "goldglade":
      return resource("gold");
    case "woodsong":
      return resource("lumber");
    case "steelstory":
      return resource("steel");
    case "craftsman":
      return [{ type: "construction", value: level >= 6 ? 20 : s }];
    case "scholar":
      return [{ type: "research", value: level >= 6 ? 20 : s }];
  }
}

/** Governor capacity by level: 2 at L4–L6, 1 below (docs/game-data.md §3). */
export function governorCapacity(level: number): number {
  return level >= 4 ? 2 : 1;
}

/** All buff categories, in display order — so zero coverage shows as a gap. */
export const BUFF_TYPES: BuffType[] = [
  "gold",
  "steel",
  "lumber",
  "harvesting",
  "construction",
  "research",
];

export const BUFF_LABEL: Record<BuffType, string> = {
  gold: "Gold",
  steel: "Steel",
  lumber: "Lumber",
  harvesting: "Harvesting",
  construction: "Construction",
  research: "Research",
};

export function isSanctum(s: Stronghold): boolean {
  return s.category === "sanctum";
}

/** Additive buff totals across all sanctums in the set (zero for uncovered). */
export function computeBuffTotals(
  strongholds: Stronghold[],
): Record<BuffType, number> {
  const totals = Object.fromEntries(BUFF_TYPES.map((t) => [t, 0])) as Record<
    BuffType,
    number
  >;
  for (const s of strongholds) {
    if (!isSanctum(s) || !s.sanctumType) continue;
    for (const b of sanctumBuffs(s.sanctumType, s.level)) {
      totals[b.type] += b.value;
    }
  }
  return totals;
}

/** Total desert EXP/h across a set of strongholds. */
export function totalExpPerHour(strongholds: Stronghold[]): number {
  return strongholds.reduce((sum, s) => sum + expPerHour(s), 0);
}
