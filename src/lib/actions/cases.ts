"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { cases } from "@/db/schema";
import { caseSchema } from "@/lib/validation/case";
import { requireUserId } from "@/lib/auth";
import { fieldErrorsFrom, type ActionResult } from "./types";
import { purgeAttachmentsForCase } from "./attachment-cascade";

function parseCaseForm(formData: FormData) {
  return caseSchema.safeParse({
    title: formData.get("title"),
    status: formData.get("status") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    notes: formData.get("notes"),
  });
}

export async function createCase(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parseCaseForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const [created] = await db
    .insert(cases)
    .values({ ...parsed.data, ownerId })
    .returning({ id: cases.id });

  revalidatePath("/cases");
  redirect(`/cases/${created.id}`);
}

export async function updateCase(
  caseId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parseCaseForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  await db
    .update(cases)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(cases.id, caseId), eq(cases.ownerId, ownerId)));

  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/cases");
  return { success: true };
}

export async function deleteCase(caseId: string): Promise<void> {
  const ownerId = await requireUserId();

  // Delete the actual files first — the DB cascade below only removes rows,
  // it would otherwise orphan every attached file in Storage.
  await purgeAttachmentsForCase(ownerId, caseId);

  await db
    .delete(cases)
    .where(and(eq(cases.id, caseId), eq(cases.ownerId, ownerId)));

  revalidatePath("/cases");
  redirect("/cases");
}
