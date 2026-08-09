"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireOfficer } from "@/lib/auth/guard";
import type { AppRole } from "@/lib/auth/roles";

/**
 * Set a user's app role (Officer/Admin). A manual change pins it (source →
 * pinned) and is honoured at the user's next login; Reset (pinned=false) falls
 * back to the Discord-derived role. ENV-allowlisted users can't be overridden.
 * Guard: only Admins may grant, change, or remove the Admin tier — Officers can
 * assign member/officer but can't create or demote an Admin.
 */
export async function setUserRole(
  userId: string,
  role: AppRole,
  pinned: boolean,
) {
  const actor = await requireOfficer();
  const [u] = await db.select().from(users).where(eq(users.id, userId));
  if (!u) throw new Error("User not found");
  if (u.roleSource === "env") throw new Error("ENV-allowlisted — cannot override");
  if ((role === "admin" || u.role === "admin") && actor !== "admin") {
    throw new Error("Only admins can grant or change the Admin role");
  }

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
