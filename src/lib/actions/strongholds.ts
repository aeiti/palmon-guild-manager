"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { strongholds } from "@/lib/db/schema";
import { requireOfficer } from "@/lib/auth/guard";

export interface StrongholdPatch {
  level?: number;
  occupier?: string | null;
  deathRate?: number | null;
  coordX?: number;
  coordY?: number;
  guardianId?: string | null;
  governorIds?: (string | null)[];
  sentryIds?: (string | null)[];
  opensAt?: string | null;
  closesAt?: string | null;
  notes?: string | null;
}

/** Update a stronghold incl. role assignments (Officer/Admin). */
export async function updateStronghold(id: string, patch: StrongholdPatch) {
  await requireOfficer();
  const { opensAt, closesAt, ...rest } = patch;
  await db
    .update(strongholds)
    .set({
      ...rest,
      ...(opensAt !== undefined
        ? { opensAt: opensAt ? new Date(opensAt) : null }
        : {}),
      ...(closesAt !== undefined
        ? { closesAt: closesAt ? new Date(closesAt) : null }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(strongholds.id, id));
  revalidatePath("/strongholds");
  revalidatePath("/");
}
