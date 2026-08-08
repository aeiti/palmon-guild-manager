import type { Member } from "@/lib/game/types";

/**
 * KPI arithmetic (docs/components.md §3.8). The definitions live here so the KPI
 * components stay presentational and the numbers stay tunable in one place.
 */

// ---- Contribution Score ----

/**
 * Weights, in the priority the user set: event participation ≫ kills >
 * donations, with event-results a modest add-on. Starting point — retune once
 * real data exists.
 */
export const CONTRIBUTION_WEIGHTS = {
  participation: 0.45,
  kills: 0.25,
  donations: 0.15,
  eventResults: 0.15,
} as const;

export interface ScoreTerm {
  label: string;
  weight: number;
  normalized: number; // 0..1
  points: number; // weight * normalized * 100
}

export interface ScoreResult {
  score: number; // 0..100
  breakdown: ScoreTerm[];
}

export interface ScoreInput {
  participationRate: number; // 0..1
  kills: number;
  donations: number;
  eventResults: number; // 0..1 (e.g. share of boards finished top-3)
}

/** Roster maxima used to normalize the raw counts. */
export interface RosterMax {
  kills: number;
  donations: number;
}

export function contributionScore(
  input: ScoreInput,
  max: RosterMax,
): ScoreResult {
  const terms: ScoreTerm[] = [
    {
      label: "Participation",
      weight: CONTRIBUTION_WEIGHTS.participation,
      normalized: clamp01(input.participationRate),
    },
    {
      label: "Kills",
      weight: CONTRIBUTION_WEIGHTS.kills,
      normalized: max.kills ? clamp01(input.kills / max.kills) : 0,
    },
    {
      label: "Donations",
      weight: CONTRIBUTION_WEIGHTS.donations,
      normalized: max.donations ? clamp01(input.donations / max.donations) : 0,
    },
    {
      label: "Event results",
      weight: CONTRIBUTION_WEIGHTS.eventResults,
      normalized: clamp01(input.eventResults),
    },
  ].map((t) => ({ ...t, points: t.weight * t.normalized * 100 }));

  const score = Math.round(terms.reduce((s, t) => s + t.points, 0));
  return { score, breakdown: terms };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

// ---- Participation streaks ----

export interface Streak {
  count: number;
  active: boolean;
}

/** Trailing run of contributed events (history ordered oldest→newest). */
export function streak(history: boolean[]): Streak {
  let count = 0;
  for (let i = history.length - 1; i >= 0 && history[i]; i--) count++;
  return { count, active: history[history.length - 1] ?? false };
}

export function participationRate(history: boolean[]): number {
  if (history.length === 0) return 0;
  return history.filter(Boolean).length / history.length;
}

// ---- Timezone coverage ----

/** UTC offset in hours for an IANA timezone right now (fractional-aware). */
export function tzOffsetHours(tz: string): number {
  const name =
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const m = name.match(/GMT([+-])(\d+)(?::(\d+))?/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2], 10) + (m[3] ? parseInt(m[3], 10) / 60 : 0));
}

const SERVER_OFFSET = -2; // UTC−2

/**
 * How many members are typically online each SERVER hour (0..23), from their
 * timezone + online windows. Converts each window from member-local to server
 * time so the gaps are real across a UTC−8…UTC+9 roster.
 */
export function coverageByHour(members: Member[]): number[] {
  const counts = new Array(24).fill(0);
  for (const m of members) {
    const shift = Math.round(SERVER_OFFSET - tzOffsetHours(m.timezone));
    for (const w of m.onlineWindows) {
      const span = (w.endHour - w.startHour + 24) % 24 || 24;
      for (let i = 0; i < span; i++) {
        const localHour = (w.startHour + i) % 24;
        const serverHour = (localHour + shift + 48) % 24;
        counts[serverHour] += 1;
      }
    }
  }
  return counts;
}
