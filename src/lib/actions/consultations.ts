"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { consultations } from "@/db/schema";
import { consultationSchema } from "@/lib/validation/consultation";
import { requireUserId } from "@/lib/auth";
import { fieldErrorsFrom, type ActionResult } from "./types";
import { purgeAttachmentsForConsultationIds } from "./attachment-cascade";

function parseConsultationForm(formData: FormData) {
  return consultationSchema.safeParse({
    illnessId: formData.get("illnessId"),
    doctorId: formData.get("doctorId"),
    date: formData.get("date"),
    reason: formData.get("reason"),
    notes: formData.get("notes"),
  });
}

export async function createConsultation(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parseConsultationForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const [created] = await db
    .insert(consultations)
    .values({ ...parsed.data, ownerId })
    .returning({ id: consultations.id });

  revalidatePath(`/illnesses/${parsed.data.illnessId}`);
  redirect(`/consultations/${created.id}`);
}

export async function updateConsultation(
  consultationId: string,
  illnessId: string,
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ownerId = await requireUserId();
  const parsed = parseConsultationForm(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  await db
    .update(consultations)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(consultations.id, consultationId), eq(consultations.ownerId, ownerId)));

  revalidatePath(`/consultations/${consultationId}`);
  revalidatePath(`/illnesses/${illnessId}`);
  return { success: true };
}

export async function deleteConsultation(
  consultationId: string,
  illnessId: string,
): Promise<void> {
  const ownerId = await requireUserId();

  await purgeAttachmentsForConsultationIds(ownerId, [consultationId]);

  await db
    .delete(consultations)
    .where(and(eq(consultations.id, consultationId), eq(consultations.ownerId, ownerId)));

  revalidatePath(`/illnesses/${illnessId}`);
  redirect(`/illnesses/${illnessId}`);
}
