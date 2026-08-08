import { auth } from "@/auth";
import type { AppRole } from "@/lib/auth/roles";

const RANK: Record<AppRole, number> = { admin: 3, officer: 2, member: 1 };

/** The signed-in user's app role, or null if not signed in. */
export async function currentRole(): Promise<AppRole | null> {
  const session = await auth();
  return session?.user?.appRole ?? null;
}

/** Throw unless the caller is at least `min`. Used to gate server actions. */
export async function requireRole(min: AppRole): Promise<AppRole> {
  const role = await currentRole();
  if (!role || RANK[role] < RANK[min]) {
    throw new Error(`Forbidden — requires ${min}`);
  }
  return role;
}

export const requireOfficer = () => requireRole("officer");
export const requireAdmin = () => requireRole("admin");
