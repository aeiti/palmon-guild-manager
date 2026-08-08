export type AppRole = "admin" | "officer" | "member";
export type RoleSource = "discord" | "env" | "pinned";

const RANK: Record<AppRole, number> = { admin: 3, officer: 2, member: 1 };

/** ADMIN_DISCORD_IDS env → always Admin (failsafe, can't lock yourself out). */
function adminIds(): string[] {
  return (process.env.ADMIN_DISCORD_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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
 * Discord role map → default member. A DB-level pinned override (user.rolePinned)
 * takes precedence over this and is applied by the caller.
 */
export function resolveAppRole(
  discordId: string,
  roleIds: string[],
): { role: AppRole; source: RoleSource } {
  if (adminIds().includes(discordId)) return { role: "admin", source: "env" };

  const map = roleMap();
  let best: AppRole = "member";
  for (const rid of roleIds) {
    const mapped = map[rid];
    if (mapped && RANK[mapped] > RANK[best]) best = mapped;
  }
  return { role: best, source: "discord" };
}
