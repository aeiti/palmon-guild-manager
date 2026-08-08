"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { requireOfficer } from "@/lib/auth/guard";
import type { LastSeenBucket, OnlineWindow } from "@/lib/game/types";

export interface MemberPatch {
  ign?: string;
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
  await db
    .update(members)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(members.id, id));
  revalidatePath("/members");
  revalidatePath("/");
  revalidatePath("/trends");
}
