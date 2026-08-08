"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guard";
import type { AppRole } from "@/lib/auth/roles";

/**
 * Set a user's app role (Admin only). A manual change pins it (source →
 * pinned); ENV-allowlisted users can't be overridden. Note the live session
 * role is still resolved from Discord on next login — this persists the
 * displayed/pinned value.
 */
export async function setUserRole(
  userId: string,
  role: AppRole,
  pinned: boolean,
) {
  await requireAdmin();
  const [u] = await db.select().from(users).where(eq(users.id, userId));
  if (!u) throw new Error("User not found");
  if (u.roleSource === "env") throw new Error("ENV-allowlisted — cannot override");

  await db
    .update(users)
    .set({
      role,
      rolePinned: pinned,
      roleSource: pinned ? "pinned" : "discord",
    })
    .where(eq(users.id, userId));
  revalidatePath("/admin");
}
