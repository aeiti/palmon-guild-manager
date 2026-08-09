export type AppRole = "admin" | "officer" | "member";
export type RoleSource = "discord" | "env" | "pinned";

const RANK: Record<AppRole, number> = { admin: 3, officer: 2, member: 1 };

/**
 * Built-in Admin allowlist, merged with ADMIN_DISCORD_IDS. Kept in code so
 * guild leads keep Admin even if the env var is unset or gets overwritten.
 */
const BUILTIN_ADMIN_IDS = [
  "1290714264780275827", // Kitsune
  "990665127537831946", // Lprdgdss
];

/** Built-ins + ADMIN_DISCORD_IDS env → always Admin (failsafe, can't lock out). */
function adminIds(): string[] {
  const fromEnv = (process.env.ADMIN_DISCORD_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return [...new Set([...BUILTIN_ADMIN_IDS, ...fromEnv])];
}

/** DISCORD_ROLE_MAP env is JSON: { "<discordRoleId>": "admin|officer|member" }. */
function roleMap(): Record<string, AppRole> {
  try {
    return JSON.parse(process.env.DISCORD_ROLE_MAP ?? "{}");
  } catch {
    return {};
  }
}

/**
 * App role from Discord identity + roles (PLAN §3). Precedence: ENV allowlist →
 * DB pin (an Admin set it on the Admin page) → Discord role map → default
 * member. The pin is read from the DB by the caller and passed in.
 */
export function resolveAppRole(
  discordId: string,
  roleIds: string[],
  pinned?: { role: AppRole } | null,
): { role: AppRole; source: RoleSource } {
  if (adminIds().includes(discordId)) return { role: "admin", source: "env" };
  if (pinned) return { role: pinned.role, source: "pinned" };

  const map = roleMap();
  let best: AppRole = "member";
  for (const rid of roleIds) {
    const mapped = map[rid];
    if (mapped && RANK[mapped] > RANK[best]) best = mapped;
  }
  return { role: best, source: "discord" };
}
