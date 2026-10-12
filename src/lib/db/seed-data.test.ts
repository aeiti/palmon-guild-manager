import { describe, expect, it } from "vitest";
import { REAL_MEMBERS, bucket } from "./seed-data";

describe("bucket", () => {
  it("parses online", () => {
    expect(bucket("on")).toEqual({ kind: "online" });
  });

  it("parses minutes and hours, including multi-digit values", () => {
    expect(bucket("4m")).toEqual({ kind: "minutes", n: 4 });
    expect(bucket("51m")).toEqual({ kind: "minutes", n: 51 });
    expect(bucket("1h")).toEqual({ kind: "hours", n: 1 });
    expect(bucket("21h")).toEqual({ kind: "hours", n: 21 });
  });

  it("parses the exact-day buckets", () => {
    expect(bucket("1d")).toEqual({ kind: "days", n: 1 });
    expect(bucket("2d")).toEqual({ kind: "days", n: 2 });
  });

  it("parses each open-ended 'over' bucket to its own threshold", () => {
    expect(bucket("3d+")).toEqual({ kind: "over", days: 3 });
    expect(bucket("7d+")).toEqual({ kind: "over", days: 7 });
    expect(bucket("30d+")).toEqual({ kind: "over", days: 30 });
  });

  it("falls back to the coarsest bucket for an unrecognised code", () => {
    expect(bucket("?")).toEqual({ kind: "over", days: 30 });
    // The game has no exact 3d bucket; without the "+" it is not recognised.
    expect(bucket("3d")).toEqual({ kind: "over", days: 30 });
  });
});

describe("REAL_MEMBERS", () => {
  it("parses every seeded last-seen code to a usable bucket", () => {
    for (const m of REAL_MEMBERS) {
      const b = m.lastSeen;
      if (b.kind === "minutes" || b.kind === "hours") {
        expect(Number.isInteger(b.n), `${m.ign}: ${JSON.stringify(b)}`).toBe(true);
        expect(b.n).toBeGreaterThan(0);
      }
    }
  });
});
