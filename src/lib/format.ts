/**
 * The ONE place numbers and times get formatted (docs/components.md §4, §5.6).
 * Components never call `toLocaleString`/`toFixed` directly — they call these,
 * so "compact everywhere, full precision in tooltips" holds site-wide.
 */

const COMPACT_UNITS: ReadonlyArray<readonly [number, string]> = [
  [1e12, "T"],
  [1e9, "B"],
  [1e6, "M"],
  [1e3, "K"],
];

/** Strip trailing zeros after a decimal point ("1.80" → "1.8", "12.00" → "12"). */
function trimZeros(s: string): string {
  return s.includes(".") ? s.replace(/\.?0+$/, "") : s;
}

/**
 * Compact game-scale numbers: `1.88T`, `421.3B`, `102.4M`, `9.6K`.
 * Mantissa keeps ~4 significant figures — 1 decimal at/above 100, else 2.
 * Below 1,000 falls back to grouped full form.
 */
export function formatCompact(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const neg = n < 0;
  const abs = Math.abs(n);
  for (const [threshold, suffix] of COMPACT_UNITS) {
    if (abs >= threshold) {
      const m = abs / threshold;
      const dec = m >= 100 ? 1 : 2;
      return `${neg ? "-" : ""}${trimZeros(m.toFixed(dec))}${suffix}`;
    }
  }
  return formatFull(n);
}

/** Grouped full number: `9,600`, `1,234,567`. */
export function formatFull(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/**
 * A ratio (0..1) as a whole-ish percent: `0.7 → "70%"`, `0.734 → "73%"`.
 * `decimals` for finer reads (win %, participation rate).
 */
export function formatPercent(ratio: number, decimals = 0): string {
  if (!Number.isFinite(ratio)) return "—";
  return `${(ratio * 100).toFixed(decimals)}%`;
}

/** EXP rate: `9,600/h`. Input is already per-hour. */
export function formatExpRate(perHour: number): string {
  return `${formatFull(perHour)}/h`;
}

/** A stored buff/percent value (already in percent units): `45 → "+45%"`. */
export function formatBuff(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value}%`;
}

export type MetricFormat = "compact" | "full" | "percent";

/**
 * Dispatcher backing the `Metric` component (docs/components.md §3.5).
 * `unit` is appended for the `full`/`compact` forms (e.g. unit "/h").
 */
export function formatMetric(
  value: number,
  format: MetricFormat = "compact",
  unit?: string,
): string {
  switch (format) {
    case "percent":
      return formatPercent(value);
    case "full":
      return unit ? `${formatFull(value)}${unit}` : formatFull(value);
    case "compact":
    default:
      return unit ? `${formatCompact(value)}${unit}` : formatCompact(value);
  }
}
