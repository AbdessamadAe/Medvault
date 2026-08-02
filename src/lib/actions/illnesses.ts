"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { illnesses } from "@/db/schema";
import { illnessSchema } from "@/lib/validation/illness";
import { requireUserId } from "@/lib/auth";
import { fieldErrorsFrom, type ActionResult } from "./types";
import { purgeAttachmentsForIllness } from "./attachment-cascade";

function parseIllnessForm(formData: FormData) {
  return illnessSchema.safeParse({
    title: formData.get("title"),
    status: formData.get("status") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    notes: formData.get("notes"),
  });
}

export async function createIllness(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parseIllnessForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const [created] = await db
    .insert(illnesses)
    .values({ ...parsed.data, ownerId })
    .returning({ id: illnesses.id });

  revalidatePath("/illnesses");
  redirect(`/illnesses/${created.id}`);
}

export async function updateIllness(
  illnessId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parseIllnessForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  await db
    .update(illnesses)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(illnesses.id, illnessId), eq(illnesses.ownerId, ownerId)));

  revalidatePath(`/illnesses/${illnessId}`);
  revalidatePath("/illnesses");
  return { success: true };
}

export async function deleteIllness(illnessId: string): Promise<void> {
  const ownerId = await requireUserId();

  // Delete the actual files first — the DB cascade below only removes rows,
  // it would otherwise orphan every attached file in Storage.
  await purgeAttachmentsForIllness(ownerId, illnessId);

  await db
    .delete(illnesses)
    .where(and(eq(illnesses.id, illnessId), eq(illnesses.ownerId, ownerId)));

  revalidatePath("/illnesses");
  redirect("/illnesses");
}
