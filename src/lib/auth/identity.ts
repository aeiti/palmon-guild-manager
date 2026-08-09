import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { members, users } from "@/lib/db/schema";
import { resolveAppRole, type AppRole, type RoleSource } from "@/lib/auth/roles";

/**
 * On sign-in: persist the caller's Discord id on their user row, auto-link the
 * roster member that carries the same Discord id, then resolve the app role —
 * honouring a DB pin set from the Admin page. The resolved role/source is
 * written back so the Admin page reflects the live value. Best-effort: the
 * caller (auth.ts) wraps this so a DB hiccup can never block login.
 */
export async function resolveIdentity(
  userId: string,
  discordId: string,
  discordRoleIds: string[],
): Promise<{ role: AppRole; source: RoleSource }> {
  // Read this user's current pin state (owned by the Admin page).
  const [row] = await db
    .select({ role: users.role, rolePinned: users.rolePinned })
    .from(users)
    .where(eq(users.id, userId));

  const pinned = row?.rolePinned ? { role: row.role } : null;
  const { role, source } = resolveAppRole(discordId, discordRoleIds, pinned);

  // Persist identity + resolved role. rolePinned is left untouched — it is
  // owned by setUserRole on the Admin page.
  await db
    .update(users)
    .set({ discordId, role, roleSource: source })
    .where(eq(users.id, userId));

  // Link the roster member with this Discord id to the account, if unlinked.
  if (discordId) {
    await db
      .update(members)
      .set({ userId })
      .where(and(eq(members.discordId, discordId), isNull(members.userId)));
  }

  return { role, source };
}
