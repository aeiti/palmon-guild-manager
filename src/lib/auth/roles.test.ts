import { afterEach, describe, expect, it, vi } from "vitest";
import { RANK, adminIds, resolveAppRole, roleMap } from "./roles";

const KITSUNE = "1290714264780275827";
const LPRDGDSS = "990665127537831946";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("adminIds", () => {
  it("returns the built-in allowlist when ADMIN_DISCORD_IDS is unset", () => {
    vi.stubEnv("ADMIN_DISCORD_IDS", undefined);
    expect(adminIds()).toEqual([KITSUNE, LPRDGDSS]);
  });

  it("returns the built-in allowlist when ADMIN_DISCORD_IDS is empty", () => {
    vi.stubEnv("ADMIN_DISCORD_IDS", "");
    expect(adminIds()).toEqual([KITSUNE, LPRDGDSS]);
  });

  it("appends env ids, trimming whitespace and dropping empty entries", () => {
    vi.stubEnv("ADMIN_DISCORD_IDS", " 111 ,, 222 ,");
    expect(adminIds()).toEqual([KITSUNE, LPRDGDSS, "111", "222"]);
  });

  it("dedupes env ids against the built-ins and each other", () => {
    vi.stubEnv("ADMIN_DISCORD_IDS", `${KITSUNE},333,333`);
    expect(adminIds()).toEqual([KITSUNE, LPRDGDSS, "333"]);
  });
});

describe("roleMap", () => {
  it("parses DISCORD_ROLE_MAP", () => {
    vi.stubEnv("DISCORD_ROLE_MAP", '{"r4":"officer","lead":"admin"}');
    expect(roleMap()).toEqual({ r4: "officer", lead: "admin" });
  });

  it("is empty when DISCORD_ROLE_MAP is unset", () => {
    vi.stubEnv("DISCORD_ROLE_MAP", undefined);
    expect(roleMap()).toEqual({});
  });

  it("falls back to {} on malformed JSON instead of throwing", () => {
    vi.stubEnv("DISCORD_ROLE_MAP", "{r4: officer");
    expect(roleMap()).toEqual({});
  });
});

describe("RANK", () => {
  it("orders admin above officer above member", () => {
    expect(RANK.admin).toBeGreaterThan(RANK.officer);
    expect(RANK.officer).toBeGreaterThan(RANK.member);
  });
});

describe("resolveAppRole", () => {
  it("gives allowlisted ids admin, ahead of any pin", () => {
    vi.stubEnv("ADMIN_DISCORD_IDS", "444");
    expect(resolveAppRole("444", [], { role: "member" })).toEqual({
      role: "admin",
      source: "env",
    });
    expect(resolveAppRole(KITSUNE, [])).toEqual({ role: "admin", source: "env" });
  });

  it("honours a pin ahead of the Discord role map", () => {
    vi.stubEnv("DISCORD_ROLE_MAP", '{"r4":"officer"}');
    expect(resolveAppRole("555", ["r4"], { role: "member" })).toEqual({
      role: "member",
      source: "pinned",
    });
  });

  it("takes the highest mapped role regardless of order", () => {
    vi.stubEnv("DISCORD_ROLE_MAP", '{"r4":"officer","lead":"admin"}');
    expect(resolveAppRole("555", ["lead", "r4"]).role).toBe("admin");
    expect(resolveAppRole("555", ["r4", "lead"]).role).toBe("admin");
  });

  it("defaults to member when no Discord role is mapped", () => {
    vi.stubEnv("DISCORD_ROLE_MAP", '{"r4":"officer"}');
    expect(resolveAppRole("555", ["unmapped"])).toEqual({
      role: "member",
      source: "discord",
    });
  });
});
