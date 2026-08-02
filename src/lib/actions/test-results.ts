"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { testResults } from "@/db/schema";
import { testResultSchema } from "@/lib/validation/test-result";
import { requireUserId } from "@/lib/auth";
import { fieldErrorsFrom, type ActionResult } from "./types";
import { purgeAttachmentsForTestResultId } from "./attachment-cascade";

function parseTestResultForm(formData: FormData) {
  return testResultSchema.safeParse({
    consultationId: formData.get("consultationId"),
    date: formData.get("date"),
    type: formData.get("type"),
    testName: formData.get("testName"),
    resultNotes: formData.get("resultNotes"),
  });
}

export async function createTestResult(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parseTestResultForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  await db.insert(testResults).values({ ...parsed.data, ownerId });

  revalidatePath(`/consultations/${parsed.data.consultationId}`);
  return { success: true };
}

export async function updateTestResult(
  testResultId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parseTestResultForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  await db
    .update(testResults)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(testResults.id, testResultId), eq(testResults.ownerId, ownerId)));

  revalidatePath(`/consultations/${parsed.data.consultationId}`);
  return { success: true };
}

export async function deleteTestResult(
  testResultId: string,
  consultationId: string,
): Promise<void> {
  const ownerId = await requireUserId();

  await purgeAttachmentsForTestResultId(ownerId, testResultId);

  await db
    .delete(testResults)
    .where(and(eq(testResults.id, testResultId), eq(testResults.ownerId, ownerId)));

  revalidatePath(`/consultations/${consultationId}`);
  redirect(`/consultations/${consultationId}`);
}
