"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { events, participation } from "@/lib/db/schema";
import { requireOfficer } from "@/lib/auth/guard";

export interface EventPatch {
  title?: string;
  status?: string;
  opponent?: string | null;
  startsAt?: string;
  typeFields?: Record<string, unknown>;
}

export async function updateEvent(id: string, patch: EventPatch) {
  await requireOfficer();
  const { startsAt, ...rest } = patch;
  await db
    .update(events)
    .set({
      ...rest,
      ...(startsAt !== undefined ? { startsAt: new Date(startsAt) } : {}),
    })
    .where(eq(events.id, id));
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/trends");
}

export interface ContribInput {
  memberId: string;
  value: number;
  subScores?: Record<string, number> | null;
}

/** Replace an event's contribution board (Officer/Admin). */
export async function setContributions(
  eventId: string,
  metric: string | null,
  entries: ContribInput[],
) {
  await requireOfficer();
  await db.delete(participation).where(eq(participation.eventId, eventId));
  if (entries.length > 0) {
    await db.insert(participation).values(
      entries.map((e) => ({
        eventId,
        memberId: e.memberId,
        signedUp: true,
        participated: true,
        metric: metric ?? null,
        value: e.value,
        subScores: e.subScores ?? null,
      })),
    );
  }
  revalidatePath("/events");
  revalidatePath("/");
  revalidatePath("/trends");
}
