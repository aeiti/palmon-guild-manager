"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { members, users } from "@/lib/db/schema";
import { requireOfficer } from "@/lib/auth/guard";
import type { LastSeenBucket, OnlineWindow } from "@/lib/game/types";

export interface MemberPatch {
  ign?: string;
  discordId?: string | null;
  guildRank?: number;
  isGuildmaster?: boolean;
  timezone?: string;
  sandstormSquad?: "A" | "B" | null;
  power?: number;
  level?: number;
  rosterStatus?: "active" | "LOA" | "inactive";
  lastSeenBucket?: LastSeenBucket;
  donations?: number;
  kills?: number;
  notes?: string | null;
  onlineWindows?: OnlineWindow[];
}

/** Update a roster member (Officer/Admin). Field-level self-edit is a follow-up. */
export async function updateMember(id: string, patch: MemberPatch) {
  await requireOfficer();

  const clean: MemberPatch = { ...patch };
  // Normalise Discord id: blank → null so the unique column stays clean.
  if (clean.discordId !== undefined) {
    clean.discordId = clean.discordId?.trim() ? clean.discordId.trim() : null;
  }

  // Friendly guard before hitting the unique constraint on members.discordId.
  if (clean.discordId) {
    const [dupe] = await db
      .select({ id: members.id })
      .from(members)
      .where(eq(members.discordId, clean.discordId));
    if (dupe && dupe.id !== id) {
      throw new Error("That Discord ID is already assigned to another member");
    }
  }

  await db
    .update(members)
    .set({ ...clean, updatedAt: new Date() })
    .where(eq(members.id, id));

  // If a Discord id was set, link this roster row to a matching account so the
  // Admin page can assign its app role without waiting for a re-login.
  if (clean.discordId) {
    const [u] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.discordId, clean.discordId));
    if (u) {
      await db
        .update(members)
        .set({ userId: u.id })
        .where(eq(members.id, id));
    }
  }

  revalidatePath("/members");
  revalidatePath("/");
  revalidatePath("/trends");
  revalidatePath("/admin");
}
