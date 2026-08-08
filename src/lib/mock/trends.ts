/**
 * Mock history/trend series for the /trends screen. Weekly guild aggregates
 * plus per-member participation history (which of the last 8 events each member
 * contributed to, oldest→newest) driving streaks and participation rate.
 */

export const TREND_WEEKS = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];

export const DONATIONS_TREND = [820, 910, 880, 1040, 1120, 1080, 1210, 1290].map(
  (k) => k * 1000,
);
export const KILLS_TREND = [12.1, 13.4, 12.8, 14.0, 15.2, 14.7, 16.1, 17.3].map(
  (m) => m * 1_000_000,
);
export const ROSTER_SIZE_TREND = [44, 45, 46, 47, 47, 48, 49, 49];
export const AVG_POWER_TREND = [
  1.28, 1.31, 1.34, 1.39, 1.44, 1.49, 1.55, 1.61,
].map((b) => b * 1_000_000_000);
export const SANDSTORM_POINTS_TREND = [
  2.1, 2.4, 1.9, 2.8, 3.1, 2.6, 3.4, 3.6,
].map((m) => m * 1_000_000);

export const SANDSTORM_RECORD = { wins: 6, losses: 2 };

/** Per-member participation over the last 8 events (oldest → newest). */
export const MOCK_PARTICIPATION_HISTORY: Record<string, boolean[]> = {
  "m-kitsune": [true, true, true, true, true, true, true, true],
  "m-aeiti": [true, true, true, true, true, true, true, true],
  "m-brann": [true, true, false, true, true, true, true, true],
  "m-suvi": [true, true, true, true, false, true, true, true],
  "m-rho": [false, true, true, true, true, true, false, true],
  "m-mira": [true, false, true, true, true, false, true, true],
  "m-tovi": [true, true, true, false, false, false, false, false],
  "m-desh": [true, false, false, true, false, false, true, false],
  "m-yara": [true, true, true, true, true, true, true, false],
  "m-pell": [false, false, false, false, false, true, true, true],
  "m-ozan": [false, true, false, false, true, false, false, true],
  "m-lio": [true, false, false, false, false, false, false, false],
};
